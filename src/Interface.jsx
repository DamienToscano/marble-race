import { useKeyboardControls } from '@react-three/drei'
import useGame from './stores/useGame.jsx'
import { useRef, useEffect } from 'react'
/* addEffect is called after the useFrame outside of the Canvas. So it allow to simulate a useFrame on pure HTML */
import { addEffect } from '@react-three/fiber'

export default function Interface() {

    const time = useRef()

    const restart = useGame((state) => state.restart)
    const phase = useGame((state) => state.phase)

    const forward = useKeyboardControls((state) => state.forward)
    const backward = useKeyboardControls((state) => state.backward)
    const leftward = useKeyboardControls((state) => state.leftward)
    const rightward = useKeyboardControls((state) => state.rightward)
    const jump = useKeyboardControls((state) => state.jump)

    useEffect(() => {
        /* We plug the addEffect, so the code inside will be executed on each frame */
        const unsubcribeEffect = addEffect(() => {
            /* We need to access the state */
            const state = useGame.getState()

            let elapsedTime = 0

            /* We update the elapsedTime according to the phase */
            if (state.phase === 'playing') {
                elapsedTime = Date.now() - state.startTime
            } else if (state.phase === 'ended') {
                elapsedTime = state.endTime - state.startTime
            }

            /* We format it */
            elapsedTime /= 1000
            elapsedTime = elapsedTime.toFixed(2)

            // Add effect can in rare case be triggered before the ref is set, so we need to ensure that our ref if defined
            if (time.current) {
                time.current.textContent = elapsedTime
            }
        }) 

        return () => {
            /* We unplug the addEffect, so the code will not be run multiple times if the component is rerender */
            unsubcribeEffect()
        }
    }, [])

    return <div className="interface">
        {/* Time */}
        <div ref={time} className="time">0.00</div>

        {/* Restart */}
        {phase === 'ended' && <div className="restart" onClick={restart}>Restart</div>}

        {/* Controls */}
        <div className="controls">
            <div className="raw">
                <div className={`key ${forward ? 'active' : ''}`}></div>
            </div>
            <div className="raw">
                <div className={`key ${leftward ? 'active' : ''}`}></div>
                <div className={`key ${backward ? 'active' : ''}`}></div>
                <div className={`key ${rightward ? 'active' : ''}`}></div>
            </div>
            <div className="raw">
                <div className={`key large ${jump ? 'active' : ''}`}></div>
            </div>
        </div>
    </div>
}