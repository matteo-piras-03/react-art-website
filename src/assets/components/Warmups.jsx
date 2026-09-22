import { Routes, Route, NavLink } from 'react-router-dom';
import commonstyles from '../scss/common_warmups_settings.module.scss';
import genstyles from '../scss/warmups.module.scss';
import { LinkPreview, TitleHead } from './additional_info/Head_info.jsx';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import { generateExercise, saveExercisetoLocalStorage } from '../js/Warmups_Data_Manager.js';

const VITE_MEDIA_SUBDOMAIN = import.meta.env.VITE_MEDIA_SUBDOMAIN;
const VITE_DOMAIN = import.meta.env.VITE_DOMAIN;
const DEFAULT_TIMER_SECONDS = 300;

import Settings from './Settings.jsx';

function Warmups() {
    return (
        <>
        <article id="main">
            <h1>Warmup Generator</h1>
            <div id={commonstyles['section-0']}>
                <NavLink
                    to="/warmups"
                    end
                    className={({ isActive }) => `${commonstyles['nav-link']} ${isActive ? commonstyles.active : ''}`}
                >
                    Generator
                </NavLink>
                <NavLink
                    to="/warmups/settings"
                    className={({ isActive }) => `${commonstyles['nav-link']} ${isActive ? commonstyles.active : ''}`}
                >
                    Exercises & Settings
                </NavLink>
            </div>
            <Routes>
                <Route path="/" element={<Generator />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </article>
        </>
    );
}

export default Warmups;

function Generator() {

    const [timerState, setTimerState] = useState({
        seconds: DEFAULT_TIMER_SECONDS,
        state: "initial" // "initial", "running", "paused", "finished"
    });

    const [exercise, setExercise] = useState({
        error: true,
        title: "No exercise generated yet",
        group: "",
        subgroup: "",
        img_src: "null",
        instructions: "",
        range: ""
    });

    function generateExercisePage() {
        setTimerState(prevState => ({
            ...prevState,
            state: "initial"
        }));
        generateExercise(exercise.title).then((exercise) => {
            setExercise(exercise);
        });
    }

    useEffect(() => {
        generateExercisePage();
    }, []);

    return (
        <>
        <TitleHead title="Warmups - pirAs03" />
        <LinkPreview
            link={VITE_DOMAIN + "/warmups/settings"}
            title="pirAs03 - Warmup Exercises Generator"
            description="A simple warmup drawing exercises generator complete with timer, instructions and score system, fully customizable by the user."
            image={VITE_MEDIA_SUBDOMAIN + "/image/asset/previews/warmups.jpg"}
        />
        <div id={genstyles['section-1']}>
            <h2>{exercise.error ? "An error occurred while generating the exercise:" : "The exercise chosen is: "}</h2>
            <div>
                <TitleBar title={exercise.title} group={exercise.group} subgroup={exercise.subgroup} error={exercise.error} />
                {(!exercise.error) && (
                <>
                    <div id={genstyles['img-and-buttons']}>
                        <img src={exercise.img_src} alt="Exercise image"/>
                        
                        <div id={genstyles['timer-and-score']}>
                            <TimerBlock timerState={timerState} setTimerState={setTimerState} />
                            <ScoreBlock timerState={timerState} exerciseKey={exercise.title} exerciseRange={exercise.range}/>
                            <button id={timerState.state === "finished" ? genstyles['next'] : genstyles['skip']} onClick={generateExercisePage}><h1>{timerState.state === "finished" ? "Next exercise" : "Skip exercise"}</h1></button>
                        </div>
                        
                    </div>
                    <InstructionsBlock instructions={exercise.instructions}/>
                </>
                )}
            </div>
        </div>
        </>
    );
}

function TitleBar({ title, group, subgroup, error }) {
    return (
        <div id={genstyles['title-bar']}>
            <h1 id={genstyles['title']}>{title}</h1>
            {!error && (
                <>
                    <span id={genstyles['group']}>{group + (subgroup ? " > " : "")}</span><span id={genstyles['subgroup']}>{subgroup}</span>
                </>
            )}
        </div>
    );
}

function TimerBlock({ timerState, setTimerState }) {

    const [muteTimerSound, setMuteTimerSound] = useState(false);

    const [timerInput, setTimerInput] = useState({
        minutes: Math.floor(DEFAULT_TIMER_SECONDS / 60),
        seconds: DEFAULT_TIMER_SECONDS % 60
    });


    const displayMinutes = Math.floor(timerState.seconds / 60);
    const displaySeconds = timerState.seconds % 60;

    useEffect(() => {
        if (timerState.state === "initial") {
            setTimerState(prevState => ({
                ...prevState,
                seconds: timerInput.minutes * 60 + timerInput.seconds,
            }));
        }
    }, [timerInput]);

    useEffect(() => {
        if (timerState.state === "running") {
            let timer = setTimeout(() => {
                setTimerState((prevState) => {
                    if (prevState.seconds > 0) {
                        return {
                            ...prevState,
                            seconds: prevState.seconds - 1
                        };
                    } else {
                        if (!muteTimerSound) {
                            playTimerElapsedSound();
                        }
                        return {
                            seconds: timerInput.minutes * 60 + timerInput.seconds,
                            state: "finished"
                        };
                    }
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [timerState.state, timerState.seconds]);

    function handleMinutesChange(event) {
        if (event.target.value === "") {
            setTimerInput((prevState) => ({
                ...prevState,
                minutes: 0
            }));
            return;
        }
        const newMinutes = parseInt(event.target.value, 10);
        if (!isNaN(newMinutes) && newMinutes >= 0 && newMinutes <= 60) {
            setTimerInput((prevState) => ({
                ...prevState,
                minutes: newMinutes
            }));
        }
    }

    function handleSecondsChange(event) {
        if (event.target.value === "") {
            setTimerInput((prevState) => ({
                ...prevState,
                seconds: 0
            }));
            return;
        }
        const newSeconds = parseInt(event.target.value, 10);
        if (!isNaN(newSeconds) && newSeconds >= 0 && newSeconds <= 59) {
            setTimerInput((prevState) => ({
                ...prevState,
                seconds: newSeconds
            }));
        }
    }

    return (
        <>
        {timerState.state !== "finished" && (
            <div id={genstyles['timer-block']} className="">
                <h1>Timer</h1>
            {timerState.state === "initial" && (
                <div id={genstyles['timer-input']}>
                    <input type="number" name="timer-minutes" id={genstyles['timer-minutes']} placeholder="MM" value={timerInput.minutes < 10 ? `0${timerInput.minutes}` : timerInput.minutes} min="0" max="60" onChange={handleMinutesChange}/>
                    <span id={genstyles['colon']}>:</span>
                    <input type="number" name="timer-seconds" id={genstyles['timer-seconds']} placeholder="SS" value={timerInput.seconds < 10 ? `0${timerInput.seconds}` : timerInput.seconds} min="0" max="59" onChange={handleSecondsChange}/>
                </div>
            )}
            {timerState.state !== "initial" && (
                <div id={genstyles['timer']}> {displayMinutes.toString().padStart(2, "0")}:{displaySeconds.toString().padStart(2, "0")}</div>
            )}
            <TimerButtons timerState={timerState} setTimerState={setTimerState} muteTimerSound={muteTimerSound} setMuteTimerSound={setMuteTimerSound} />
        </div>
        )}
        </>
    );
}

function playTimerElapsedSound(){
    const audio = new Audio("../../assets/sounds/timer_elapsed.mp3");
    audio.volume = 0.5;
    audio.play();
};

function TimerButtons({ timerState, setTimerState, muteTimerSound, setMuteTimerSound }) {

    useEffect(() => {
        const storedMuteState = localStorage.getItem("sound-muted");
        storedMuteState !== null ? setMuteTimerSound(storedMuteState === "true") : setMuteTimerSound(false);
    }, []);

    const startTimer = () => {
        setTimerState(prev => ({
            ...prev,
            state: "running"
        }));
    }

    const pauseTimer = () => {
        setTimerState(prev => ({
            ...prev,
            state: "paused"
        }));
    }

    const resetTimer = () => {
        setTimerState({
            seconds: DEFAULT_TIMER_SECONDS,
            state: "initial"
        });
    }

    const toggleSound = () => {
        setMuteTimerSound(prev => !prev);
        localStorage.setItem("sound-muted", !muteTimerSound);
        muteTimerSound ? playTimerElapsedSound() : "";
    }

    return (
        <>
            {timerState.state !== "finished" && (
                <div id={genstyles['timer-buttons']}>
                {timerState.state === "running" ? (
                    <button id={genstyles['pause']} onClick={pauseTimer}>Pause</button>
                ) : (
                    <button id={genstyles['start']} onClick={startTimer}>
                        {timerState.state === "paused" ? "Resume" : "Start"}
                    </button>
                )}

                <button id={genstyles['reset']} onClick={resetTimer}>Reset</button>
                {(timerState.state !== "running") && (
                    <button id={genstyles['sound']} onClick={toggleSound}>
                        {muteTimerSound ? (
                            <img src="assets/svg/volume-xmark-svgrepo-com.svg" alt="Muted"/>
                        ) : (
                            <img src="assets/svg/volume-max-svgrepo-com.svg" alt="Sound"/>
                        )}
                    </button>
                )}
            </div>
            )}
        </>
    );
}

function ScoreBlock( { timerState, exerciseKey, exerciseRange} ) {
    const [messageDisplay, setMessageDisplay] = useState(false);

    useEffect(() => {
        if (timerState.state !== "finished") {
            setMessageDisplay(false);
        }
    }, [timerState.state]);

    const handleScoreChange = (value) => {
        setMessageDisplay(value === 1 ? "Good job!" : "Keep practicing!");
        const newScore = Math.max(1, Math.min(exerciseRange + value, 5));
        saveExercisetoLocalStorage(
            exerciseKey,
            newScore,
            null,
            null,
            "updateRange"
        );
    };

    return (
        <>
            {timerState.state === "finished" && (
            <div id={genstyles['score-block']}>
                <h1>How did the exercise go?</h1>
                {!messageDisplay &&(
                    <>
                        <div id={genstyles['score-buttons']}>
                            <button id={genstyles['bad']} onClick={() => handleScoreChange(-1)}>
                                Bad... (-1)
                            </button>
                            <button id={genstyles['good']} onClick={() => handleScoreChange(1)}>
                                Good! (+1)
                            </button>
                        </div>
                    </>
                )}
                {messageDisplay &&(
                    <div id={genstyles['checkmark']}>
                        {messageDisplay}
                    </div>
                )}
            </div>
            )}
        </>
    );
}

function InstructionsBlock({ instructions }) {
    return (
        <div id={genstyles['instructions']} className="">
            <h1>Instructions</h1>
            <ReactMarkdown id={genstyles['instructions-content']}>{instructions}</ReactMarkdown>
        </div>
    );
}