import { OrbitControls } from '@react-three/drei'
import Lights from './Lights.jsx'
import Level from "./Level.jsx";
import { Physics } from '@react-three/rapier';
import Player from "./Player.jsx";
import useGame from "./stores/use-game.js";
import Effects from "./Effects.jsx";

export default function Experience() {
    const blocksCount = useGame((state) => state.blocksCount);
    const blockSeed = useGame((state) => state.blockSeed);
    return <>
        <color args={['#252731']} attach="background"/>
        <OrbitControls makeDefault />
        <Physics>
            <Level count={blocksCount} blockSeed={blockSeed} />
            <Player />
        </Physics>
        <Lights />
        <Effects />
    </>
}
