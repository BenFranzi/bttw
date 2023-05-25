import {create} from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const useGame = create(subscribeWithSelector((set) => {
  return {
    blocksCount: 3,
    phase: 'ready',
    startTime: 0,
    endTime: 0,
    blockSeed: 0, // Not a real seed
    start: () => {
      set((state) =>
      {
        if(state.phase === 'ready')
          return { phase: 'playing', startTime: Date.now() };

        return {}
      })
    },
    restart: () =>
    {
      set((state) => {
        if(state.phase === 'playing' || state.phase === 'ended')
          return { phase: 'ready', ...(state.phase === 'ended' && { blockSeed: state.blockSeed + 1 } ) }

        return {}
      })
    },
    end: () => {
      set((state) => {
        if(state.phase === 'playing') {
          return {phase: 'ended', endTime: Date.now()};
        }

        return {}
      })
    }
  };
}))

export default useGame;
