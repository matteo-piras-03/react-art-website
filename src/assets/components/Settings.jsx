import { useState, useMemo, useEffect, useContext, createContext } from 'react';
import { createPortal } from 'react-dom';
import groupList from '../json/warmups.json';
import settingsstyles from '../scss/settings.module.scss';
import { LinkPreview, TitleHead } from "./additional_info/Head_info.jsx";

const VITE_MEDIA_SUBDOMAIN = import.meta.env.VITE_MEDIA_SUBDOMAIN;
const VITE_DOMAIN = import.meta.env.VITE_DOMAIN;

import {getStoredInnerButtonRecords, saveDefaultExercisesToLocalStorage, saveExercisetoLocalStorage, getStoredCustomExercises, deleteCustomExerciseFromLocalStorage, buildExportJSON, handleImportData} from "../js/Warmups_Data_Manager"

const buttonRecordsContext = createContext();
const customExercisesContext = createContext();

export default function Settings() {
    const [customExercises, setCustomExercises] = useState(getStoredCustomExercises);
    const [innerButtonRecords, setInnerButtonRecords] = useState(getStoredInnerButtonRecords);

    return (
        <>
            <TitleHead title="Warmup generator settings - pirAs03" />
            <LinkPreview
                link={VITE_DOMAIN + "/warmups/settings"}
                title="pirAs03 - Warmup Exercises Generator Settings"
                description="A simple warmup drawing exercises generator complete with timer, instructions and score system, fully customizable by the user."
                image={VITE_MEDIA_SUBDOMAIN + "/image/asset/previews/settings.jpg"}
            />
            <buttonRecordsContext.Provider value={{ innerButtonRecords, setInnerButtonRecords }}>
                <customExercisesContext.Provider value={{ customExercises, setCustomExercises }}>
                    <div id={settingsstyles['section-1']}>
                        <h1>Exercises list</h1>
                        <p>Exercises with a higher score have a lower chance to appear.</p>
                        <ExerciseList />
                    </div>
                    <div id={settingsstyles['section-2']}>
                        <h1>Import/Export data</h1>
                        <p>You can export your data to a JSON file and import it later. This is useful if you want to transfer your data to another device or if you want to backup your data.</p>
                        <ImportExport setCustomExercises={setCustomExercises} setInnerButtonRecords={setInnerButtonRecords} />
                    </div>
                    <div id={settingsstyles['section-3']}>
                        <h1>Reset data</h1>
                        <p>You can reset your data to the default values. This will remove all of your custom exercises and restore the default settings (all lesson 1 and 2 exercises, plus boxes and cylinders get selected).</p>
                        <ResetData setInnerButtonRecords={setInnerButtonRecords} setCustomExercises={setCustomExercises} />
                    </div>
                </customExercisesContext.Provider>
            </buttonRecordsContext.Provider>
        </>
    );
}

function ExerciseList() {
    const [modalVisible, setModalVisible] = useState(false);

    return(
        <>
            <ul id={settingsstyles['exercises-list']}>
                {groupList.map((group, index) =>
                    <ExerciseGroup key={group.label} group={group}
                />)}
                <div>
                    <CustomExerciseGroup setModalVisible={setModalVisible}/>
                    <CustomExerciseModalView visible={modalVisible} setModalVisible={setModalVisible}/>
                </div>
            </ul>
        </>
    );
}

function ExerciseGroup({ group }) {

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <GroupButton label={group.label} setIsExpanded={setIsExpanded} isExpanded={isExpanded} />
            <ul className={isExpanded ? '' : settingsstyles.hidden}>
                {group.subgroups.map((subgroup, subindex) => (
                    <ExerciseSubgroup key={subgroup.label} subgroup={subgroup}/>
                ))}
            </ul>
        </div>
    );
}

function ExerciseSubgroup({ subgroup }) {

    const { innerButtonRecords, setInnerButtonRecords } = useContext(buttonRecordsContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const recordsMap = useMemo(
        () =>
            new Map(
                innerButtonRecords.filter(record => !record.isCustomExercise).map(record => [
                    record.key,
                    record
                ])
            ),
        [innerButtonRecords]
    );

    const selectedExercises = subgroup.exercises.map((exercise) => {
        const record = recordsMap.get(exercise.label);
        return record ? record.selected : false;
    });
    const rangeValues = subgroup.exercises.map((exercise) => {
        const record = recordsMap.get(exercise.label);
        return record ? record.range : "1";
    });

    const isAllSelected = selectedExercises.every(v => v);

    const toggleAll = () => {
        subgroup.exercises.forEach((exercise) => {
            saveExercisetoLocalStorage(exercise.label, null, !isAllSelected, false, "toggle");
        });
        setInnerButtonRecords(records => records.map(record => (
            subgroup.exercises.some(exercise => exercise.label === record.key)
                ? { ...record, selected: !isAllSelected }
                : record
        )));
    };

    const toggleExercise = (label) => {
        //console.log(recordsMap);
        const currentSelected = recordsMap.get(label)?.selected || false;
        saveExercisetoLocalStorage(label, null, !currentSelected, false, "toggle");
        setInnerButtonRecords(records => records.map(record => (
            record.key === label
                ? { ...record, selected: !currentSelected }
                : record
        )));
    };

    const rangeValueHandler = (label, value) => {
        saveExercisetoLocalStorage(
            label,
            value,
            null,
            null,
            "updateRange"
        );
        setInnerButtonRecords(records => records.map(record => (
            record.key === label
                ? { ...record, range: value }
                : record
        )));
    };

    return (
        <div>
            <SubgroupButton label={subgroup.label} setIsExpanded={setIsExpanded} isExpanded={isExpanded} indicatorHandler={toggleAll} parentSelected={isAllSelected} />
            <ul className={isExpanded ? '' : settingsstyles.hidden}>
                {subgroup.exercises.map((exercise, exindex) => (
                    <ExerciseButton key={exercise.label} label={exercise.label} indicatorHandler={() => toggleExercise(exercise.label)} childSelected={selectedExercises[exindex]} rangeValue={rangeValues[exindex]} rangeValueHandler={(value) => rangeValueHandler(exercise.label, value)} />
                ))}
            </ul>
        </div>
    );
}

function CustomExerciseGroup({ setModalVisible }) {
    const [customisExpanded, setCustomIsExpanded] = useState(false);
    const { customExercises, setCustomExercises } = useContext(customExercisesContext);
    const { innerButtonRecords, setInnerButtonRecords } = useContext(buttonRecordsContext);

    const recordsMap = useMemo(
        () =>
            new Map(
                innerButtonRecords.filter(record => record.isCustomExercise).map(record => [
                    record.key,
                    record
                ])
            ),
        [innerButtonRecords]
    );

    const selectedExercises = customExercises?.map((exercise) => {
        const record = recordsMap.get(exercise.name);
        return record ? record.selected : false;
    }) || [];
    const rangeValues = customExercises?.map((exercise) => {
        const record = recordsMap.get(exercise.name);
        return record ? record.range : "1";
    }) || [];

    const toggleExercise = (label) => {
        //console.log(recordsMap);
        const currentSelected = recordsMap.get(label)?.selected || false;
        saveExercisetoLocalStorage(label, null, !currentSelected, true, "toggle");
        setInnerButtonRecords(records => records.map(record => (
            record.key === label
                ? { ...record, selected: !currentSelected }
                : record
        )));
    };

    const deleteExercise = (label) => {
        if (deleteCustomExerciseFromLocalStorage(label)) {
            setCustomExercises(exercises => exercises.filter(exercise => exercise.name !== label));
            setInnerButtonRecords(records => records.filter(record => record.key !== label));
        }
    }

    const rangeValueHandler = (label, value) => {
        saveExercisetoLocalStorage(
            label,
            value,
            null,
            null,
            "updateRange"
        );
        setInnerButtonRecords(records => records.map(record => (
            record.key === label
                ? { ...record, range: value }
                : record
        )));
    };

    return (
        <>
            <li id={settingsstyles['custom-exercises-li']} onClick={() => setCustomIsExpanded(!customisExpanded)}>
                <button className={settingsstyles['outer-button']}>
                    <div><span>Custom exercises</span></div>
                    <img src="../../assets/svg/chevron-down-svgrepo-com.svg" alt="Expand" className={customisExpanded ? settingsstyles['rotated'] : '' } />
                </button>
            </li>
            <ul id={settingsstyles['custom-exercises-ul']} className={customisExpanded ? '' : settingsstyles.hidden}>
                {customExercises?.map((exercise, index) => (
                    <CustomExerciseButton key={exercise.name} label={exercise.name} childSelected={selectedExercises[index]} rangeValue={rangeValues[index]} rangeValueHandler={(value) => rangeValueHandler(exercise.name, value)} indicatorHandler={() => toggleExercise(exercise.name)} deleteHandler={deleteExercise} />
                ))}
                
                <li>
                    <button className={settingsstyles['inner-button']} id="new-exercise-button" onClick={() => setModalVisible(true)}>
                        <div><img src="../assets/svg/plus-svgrepo-com.svg" className={settingsstyles['plus']}/><span>Add custom exercise...</span></div>
                    </button>
                </li>   
            </ul>
        </>
    );
}

function GroupButton({label, setIsExpanded, isExpanded}) { 
    return (
        <>
            <li>
                <button className={settingsstyles['outer-button']} onClick={setIsExpanded ? () => {setIsExpanded(!isExpanded)} : null}>
                    <div><span>{label}</span></div>
                    <img src="../../assets/svg/chevron-down-svgrepo-com.svg" alt="Expand" className={isExpanded ? settingsstyles['rotated'] : '' } />
                </button>
            </li>
        </>
    );
}

function SubgroupButton({label, setIsExpanded, isExpanded, indicatorHandler, parentSelected}) {
    return (
        <>
            <li>
                <button className={settingsstyles['middle-button']} onClick={setIsExpanded ? () => {setIsExpanded(!isExpanded)} : null}>
                    <div><div className={`${settingsstyles['indicator']} ${parentSelected ? settingsstyles['selected'] : ''}`} onClick={(e) => {e.stopPropagation(); indicatorHandler();}}></div><span>{label}</span></div>
                    <img src="../../assets/svg/chevron-down-svgrepo-com.svg" alt="Expand" className={isExpanded ? settingsstyles['rotated'] : '' } />
                </button>
            </li>
        </>
    );
}

function ExerciseButton({label, indicatorHandler, childSelected, rangeValue, rangeValueHandler}) {
    return (
        <>
            <li>
                <button className={settingsstyles['inner-button']} onClick={(e) => {e.stopPropagation(); indicatorHandler();}}>
                    <div><div className={`${settingsstyles['indicator']} ${childSelected ? settingsstyles['selected'] : ''}`}></div><span>{label}</span></div>
                    <input type="range" name="score" min="1" max="5" value={rangeValue? rangeValue : 1} onChange={(e) => {rangeValueHandler(e.target.value);}} onClick={(e) => {e.stopPropagation();}}/>
                </button>
            </li>
        </>
    );
}

function CustomExerciseButton({label, indicatorHandler, childSelected, rangeValue, rangeValueHandler, deleteHandler}) {
    return (
        <>
            <li>
                <button className={settingsstyles['inner-button']} onClick={(e) => {e.stopPropagation(); indicatorHandler();}}>
                    <div><div className={`${settingsstyles['indicator']} ${childSelected ? settingsstyles['selected'] : ''}`}></div><span>{label}</span></div>
                    <div>
                        <img src="../assets/svg/trash-alt-svgrepo-com.svg" className={settingsstyles['trash-icon']} onClick={(e) => {e.stopPropagation(); deleteHandler(label);}}/>
                        <input type="range" name="score" min="1" max="5" value={rangeValue? rangeValue : 1} onChange={(e) => {rangeValueHandler(e.target.value);}} onClick={(e) => {e.stopPropagation();}}/>
                    </div>
                </button>
            </li>
        </>
    );
}

function CustomExerciseModalView({ visible, setModalVisible }){
    const [errorMessage, setErrorMessage] = useState({
        display: false,
        submitDisabled: true,
        message: ""
    });

    const [exerciseName, setExerciseName] = useState("");
    const [exerciseImage, setExerciseImage] = useState("");
    const [exerciseInstructions, setExerciseInstructions] = useState("");

    const { customExercises, setCustomExercises } = useContext(customExercisesContext);
    const { innerButtonRecords, setInnerButtonRecords } = useContext(buttonRecordsContext);

    function handleNameChange(event) {
        setExerciseName(event.target.value);
        if (event.target.value.length < 1) {
            setErrorMessage({
                display: true,
                submitDisabled: true,
                message: "Please enter a valid exercise name."
            });
            return;
        }
        if (innerButtonRecords.some((record) => record.key === event.target.value)) {
            setErrorMessage({
                display: true,
                submitDisabled: true,
                message: "An exercise with this name already exists."
            });
            return;
        }
        setErrorMessage({
            display: false,
            submitDisabled: false,
            message: ""
        });
    }

    function handleImageChange(event) {
        setExerciseImage(event.target.value);
    }

    function handleInstructionsChange(event) {
        setExerciseInstructions(event.target.value);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        if (errorMessage.submitDisabled) {
            return;
        }
        //console.log("Saving new exercise:", exerciseName, exerciseImage, exerciseInstructions);
        setModalVisible(false);
        setExerciseName("");
        setErrorMessage({
            display: false,
            submitDisabled: true,
            message: ""
        });
        setExerciseImage("");
        setExerciseInstructions("");
        if (saveExercisetoLocalStorage(exerciseName, null, true, true, "addCustom", exerciseImage, exerciseInstructions)) {
            setCustomExercises(getStoredCustomExercises());
            setInnerButtonRecords(records => [
                ...records,
                {
                    key: exerciseName,
                    range: 1,
                    selected: true,
                    isCustomExercise: true
                }
            ]);
        }
    }

    return createPortal(
        <>
            <div id={settingsstyles['modal-view']} className={visible ? settingsstyles['visible'] : ''} onClick={() => setModalVisible(false)}>
                <div id={settingsstyles['modal-view-sub']} onClick={(e) => e.stopPropagation()}>
                    <form name="new-exercise-form" id={settingsstyles['new-exercise-form']} onSubmit={handleFormSubmit}>
                        <label htmlFor={settingsstyles['exercise-name']}>Exercise Name:</label>
                        <input type="text" id={settingsstyles['exercise-name']} name="exercise-name" onChange={handleNameChange} onBlur={handleNameChange} value={exerciseName}/>
                        <span className={`${settingsstyles['error-message']} ${errorMessage.display ? '' : settingsstyles['hidden']}`} id={settingsstyles['exercise-name-error']}>{errorMessage.message}</span>
                        <label htmlFor={settingsstyles['exercise-image']}>Image URL:</label>
                        <input type="text" id={settingsstyles['exercise-image']} name="exercise-image" onChange={handleImageChange} onBlur={handleImageChange} value={exerciseImage}/>
                        <label htmlFor={settingsstyles['exercise-instructions']}>Caption (also supports <a href="https://daringfireball.net/projects/markdown/">markdown</a>):</label>
                        <textarea id={settingsstyles['exercise-instructions']} name="exercise-instructions" onChange={handleInstructionsChange} onBlur={handleInstructionsChange} value={exerciseInstructions}></textarea>
                        <button type="submit" className={errorMessage.submitDisabled ? settingsstyles['disabled'] : ''}>Save Exercise</button>
                    </form>
                </div>
            </div>
        </>, document.body
    );
}

function ImportExport({ setCustomExercises, setInnerButtonRecords }) {

    const [exportAreaValue, setExportAreaValue] = useState("");
    const [importAreaValue, setImportAreaValue] = useState("");

    const handleExportSubmit = (e) => {
        e.preventDefault();
        const exportData = buildExportJSON();
        setExportAreaValue(exportData);
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (handleImportData(importAreaValue)) {
            setCustomExercises(getStoredCustomExercises());
            setInnerButtonRecords(getStoredInnerButtonRecords());
        }
    }

    return(
        <>
        <ul>
            <li>
                <form name="export-form" id="export-form" onSubmit={handleExportSubmit}>
                    <textarea id={settingsstyles['export-data']} readOnly placeholder="Exported data will appear here" value={exportAreaValue}></textarea>
                    <button id={settingsstyles['export-button']} type="submit">Export data</button>
                </form>
            </li>
            <li>
                <form name="import-form" id="import-form" onSubmit={handleImportSubmit}>
                    <textarea id={settingsstyles['import-data']} placeholder="Paste imported data here" value={importAreaValue} onChange={(e) => setImportAreaValue(e.target.value)}></textarea>
                    <button id={settingsstyles['import-button']} type="submit">Import data</button>
                </form>
            </li>
        </ul>
        </>
    );
}

function ResetData({ setInnerButtonRecords, setCustomExercises }) {

    return(
        <>
            <button
                id={settingsstyles['reset-button']}
                onClick={() => {
                    if (saveDefaultExercisesToLocalStorage()) {
                        setInnerButtonRecords(getStoredInnerButtonRecords());
                        setCustomExercises(getStoredCustomExercises());
                    }
                }}
            >
                Reset data
            </button>
        </>
    );
}
