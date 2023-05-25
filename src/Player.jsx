import {RigidBody, useRapier} from "@react-three/rapier";
import {useFrame} from "@react-three/fiber";
import {useKeyboardControls} from "@react-three/drei";
import {useEffect, useRef, useState} from "react";
import * as THREE from 'three';
import useGame from "./stores/use-game.js";

export default function Player() {
  /** @type {React.MutableRefObject<RigidBody>} */
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  const [smoothCameraPosition] = useState(() => new THREE.Vector3(10, 10,  10));
  const [smoothCameraTarget] = useState(() => new THREE.Vector3());
  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const restart = useGame((state) => state.restart);
  const blocksCount = useGame((state) => state.blocksCount);

  const jump = () => {
    if (!body.current) return;

    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const rapierWorld = world.raw();
    const hit = rapierWorld.castRay(ray, 10, true);

    if (hit.toi < 0.15) {
      body.current.applyImpulse({x: 0, y: .5, z: 0}, true);
    }
  }

  const reset = () => {
    body.current.setTranslation({x: 0, y: 1, z: 0});
    body.current.setLinvel({x: 0, y: 0, z: 0});
    body.current.setAngvel({x: 0, y: 0, z: 0});
  }

  useEffect(() => {
    const unsubscribeReset = useGame.subscribe(
      (state) => state.phase,
      (phase) => {
        if (phase === 'ready') {
          reset();
        }
      }
    )

    const unsubscribeJump = subscribeKeys(
      (state) => state.jump,
      (value) => {

        if (value) {
          jump();
        }
      });

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });
    return () => {
      unsubscribeJump();
      unsubscribeAny();
      unsubscribeReset();
    }
  }, []);

  useFrame((state, delta) => {
    /**
     * controls
     */
    if (!body.current) return;
    const {forward, backward, left, right, jump} = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impluseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    if (forward) {
      impulse.z -= impluseStrength;
      torque.x -= torqueStrength;
    }
    if (right) {
      impulse.x += impluseStrength;
      torque.z -= torqueStrength;
    }
    if (backward) {
      impulse.z += impluseStrength;
      torque.x += torqueStrength;
    }
    if (left) {
      impulse.x -= impluseStrength;
      torque.z += torqueStrength;
    }


    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);

    /**
     * camera
     */
    const bodyPosition = body.current.translation();

    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.z += 2.25;
    cameraPosition.y += 0.65;

    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;

    smoothCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothCameraTarget.lerp(cameraTarget, 5 * delta);

    state.camera.position.copy(smoothCameraPosition);
    state.camera.lookAt(smoothCameraTarget);

    /**
     * Phases
     */
    if (bodyPosition.z < - (blocksCount * 4 + 2)) {
      end();
    }

    if (bodyPosition.y < -10) {
      restart();
    }
  });

  return (
    <RigidBody
      ref={body}
      colliders="ball"
      position={[0, 1, 0]}
      restitution={0.2}
      friction={1}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <mesh castShadow>
        <icosahedronGeometry args={[0.3, 1]}/>
        <meshStandardMaterial flatShading color="mediumpurple" />
      </mesh>
    </RigidBody>
  )
}
