import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'


/* We create a store */
/* We use subscribeWithSelector to allow subscription on the store changes */
export default create(subscribeWithSelector((set) => {
    return {
        blocksCount: 10,
        blockSeed: 0,

        /**
         * Time
         */
        startTime: 0,
        endTime: 0,



        /**
         * Phases of the game
         */
        phase: 'ready',

        /* start will change the phase to playing */
        start: () => {
            set((state) => {
                /* We change the state only if it is ready */
                if (state.phase === 'ready') {
                    return { phase: 'playing', startTime: Date.now() }
                }

                return {}
            })
        },

        /* restart will change the phase to ready */
        restart: () => {
            set((state) => {
                /* We change the state only if it is playing or ended */
                if (state.phase === 'playing' || state.phase === 'ended')
                    /* We provide a new block seed if we restart the game */
                    return { phase: 'ready', blockSeed: Math.random() }

                return {}
            })
        },

        /* end will change the phase to ended */
        end: () => {
            set((state) => {
                /* We change the state only if it is playing */
                if (state.phase === 'playing')
                    return { phase: 'ended', endTime: Date.now() }

                return {}
            })
        }
    }
}))