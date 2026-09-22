import defaultExercises from '../json/warmups_default.json';
import allExercises from '../json/warmups.json';

export { getStoredInnerButtonRecords,
    getStoredCustomExercises ,
    saveDefaultExercisesToLocalStorage,
    saveExercisetoLocalStorage,
    deleteCustomExerciseFromLocalStorage,
    buildExportJSON,
    handleImportData,
    generateExercise
 };

// Local Storage Management Functions

function getStoredInnerButtonRecords() {
    
    try {
        const storedRecords = JSON.parse(localStorage.getItem("inner-button-selections") || "[]");

        if (!Array.isArray(storedRecords)) {
            return [];
        }

        if(storedRecords.length === 0){
            saveDefaultExercisesToLocalStorage(true);
            return getStoredInnerButtonRecords();
        }
        return storedRecords.map(record => normalizeInnerButtonRecord(record));
        
    } catch (error) {
        saveDefaultExercisesToLocalStorage();
        return [];
    }
}

/*
function deleteAllStoredData() {
    const confirmation = window.confirm("Are you sure you want to delete all stored data? This action cannot be undone.");
    if (!confirmation) {
        return false;
    }
    localStorage.clear();
    return true;
}
*/

function getStoredCustomExercises() {
    try {
        const storedRecords = JSON.parse(localStorage.getItem("custom-exercises") || "[]");

        if (!Array.isArray(storedRecords)) {
            return [];
        }

        return storedRecords;
        
    } catch (error) {
        return [];
    }
}

function saveExercisetoLocalStorage(key, range, isSelected, isCustomExercise, operation, image, instructions) {
    const storedRecords = getStoredInnerButtonRecords();
    const index = storedRecords.findIndex(record => record.key === key);
    if ((index == -1) && (operation !== "addCustom")) {
        return false;
    }
    const previousRange = storedRecords[index] ? storedRecords[index].range : 1;
    switch (operation) {
        case "toggle":
            
            if (isSelected) {
                //console.log("Saving exercise to localStorage:", { key, range: previousRange, selected: isSelected, isCustomExercise });
            } else {
                //console.log("Removing exercise from localStorage:", { key, range: previousRange, selected: isSelected, isCustomExercise });
            }
            
            storedRecords.splice(index, 1, { key, range: previousRange, selected: isSelected, isCustomExercise });
            localStorage.setItem("inner-button-selections", JSON.stringify(storedRecords));
            return true;
        case "updateRange":
            //console.log("Updating range for exercise in localStorage:", { key, range });
            storedRecords[index].range = range;
            localStorage.setItem("inner-button-selections", JSON.stringify(storedRecords));
            return true;
        case "addCustom":
            const customExercises = getStoredCustomExercises();
            if (customExercises.some(exercise => exercise.name === key)) {
                //console.log("Custom exercise already exists in localStorage");
                return false;
            }
            //console.log("Adding custom exercise to localStorage: ", { name: key, image, instructions });
            customExercises.push({ name: key, image, instructions });
            localStorage.setItem("custom-exercises", JSON.stringify(customExercises));
            storedRecords.push({ key, range: 1, selected: isSelected, isCustomExercise: true });
            localStorage.setItem("inner-button-selections", JSON.stringify(storedRecords));
            return true;
        default:
            return false;
    }
}

function saveDefaultExercisesToLocalStorage(skipConfirmation = false) {
    if (!skipConfirmation) {
        const confirmation = window.confirm("Are you sure you want to reset your data to the default values? This will remove all of your custom exercises and restore the default settings (all lesson 1 and 2 exercises, plus boxes and cylinders get selected).");
        if (!confirmation) {
            return false;
        }
    }

    localStorage.removeItem("inner-button-selections");
    localStorage.removeItem("custom-exercises");

    const allExercisesArray = allExercises.flatMap(group => group.subgroups.flatMap(subgroup => subgroup.exercises.map(exercise => exercise.label)));
    //console.log("All exercises from JSON:", allExercisesArray);

    const defaultRecords = defaultExercises.map((exercise) => ({
        key: exercise,
        range: "1",
        selected: true,
        isCustomExercise: false
    }));

    const nonDefaultRecords = allExercisesArray
    .filter(exercise => !defaultExercises.includes(exercise))
    .map((exercise) => ({
        key: exercise,
        range: "1",
        selected: false,
        isCustomExercise: false
    }));

    localStorage.setItem("inner-button-selections", JSON.stringify(defaultRecords.concat(nonDefaultRecords)));
    return true;
}

function deleteCustomExerciseFromLocalStorage(exerciseName) {
    if (!skipConfirmation) {
        const confirmation = window.confirm(`Are you sure you want to delete the custom exercise "${exerciseName}"? This action cannot be undone.`);
        if (!confirmation) {
            return false;
        }
    }

    const customExercises = getStoredCustomExercises();
    const storedRecords = getStoredInnerButtonRecords();

    const customIndex = customExercises.findIndex(exercise => exercise.name === exerciseName);
    if (customIndex == -1){
        console.warn(`Custom exercise "${exerciseName}" not found in localStorage.`);
        return false;
    }
    const recordIndex = storedRecords.findIndex(record => record.key === exerciseName);
    if (recordIndex == -1){
        console.warn(`Record for exercise "${exerciseName}" not found in localStorage.`);
        return false;
    }

    customExercises.splice(customIndex, 1);
    storedRecords.splice(recordIndex, 1);

    localStorage.setItem("custom-exercises", JSON.stringify(customExercises));
    localStorage.setItem("inner-button-selections", JSON.stringify(storedRecords));
    //console.log(`Custom exercise "${exerciseName}" and its record have been deleted from localStorage.`);
    return true;
}


function normalizeInnerButtonRecord(record) {
    if (!record || typeof record !== "object") {
        return null;
    }

    if (typeof record.key !== "string") {
        return null;
    }

    let normalizedRange = 1;

    if (typeof record.range === "string") {
        const parsedRange = parseInt(record.range, 10);
        normalizedRange = Number.isFinite(parsedRange) && parsedRange >= 1
            ? Math.min(5, Math.floor(parsedRange))
            : 1;
    }
    else if (typeof record.range === "number") {
        normalizedRange = Number.isFinite(record.range) && record.range >= 1
            ? Math.min(5, Math.floor(record.range))
            : 1;
    }

    if (normalizedRange === null || typeof record.selected !== "boolean" || typeof record.isCustomExercise !== "boolean") {
        return null;
    }

    return {
        key: record.key,
        range: normalizedRange,
        selected: record.selected,
        isCustomExercise: record.isCustomExercise,
    };
}

// Import and Export Functions

function buildExportJSON() {
    const storedRecords = getStoredInnerButtonRecords();
    const customExercises = getStoredCustomExercises();

    const exportPayload = {
        version: 3,
        innerButtonRecords: storedRecords,
        customExercises: customExercises,
    };

    return JSON.stringify(exportPayload, null, 2);
}

function handleImportData(rawImportData) {

    if (!rawImportData) {
        alert("Please paste a valid export file before importing.");
        return;
    }

    let parsedImportData;

    try {
        parsedImportData = JSON.parse(rawImportData);
    } catch (error) {
        alert("The imported data is not valid JSON.");
        return;
    }

    const validatedData = validateImportData(parsedImportData);

    if (!validatedData) {
        alert("The imported data does not match the expected save format.");
        return;
    }

    applyImportedData(validatedData);

    alert("Import successful!");
    return true;
}

function validateImportData(importData) {
    if (!importData || typeof importData !== "object" || Array.isArray(importData)) {
        return null;
    }
    
    //Version 2 conversion
    if (importData.version === 1) {
        //console.log("Converting imported data from version 1 to version 2 format.");
        importData.innerButtonSelections.forEach((record) => {
            if (record && typeof record.label === "string" && record.label.trim() !== "") {
                record.key = record.label.trim();
            }
        });
        importData.version = 2;
    }

    //Version 3 conversion
    if (importData.version === 2) {
        //console.log("Converting imported data from version 2 to version 3 format.");
        importData.innerButtonSelections.forEach((record) => {
            if (record && typeof record.range === "string") {
                record.range = record.range.trim() !== "" ? Math.min(5, Math.floor(parseInt(record.range, 10))) : 1;
            }
        });
        importData.innerButtonRecords = importData.innerButtonSelections;
        delete importData.innerButtonSelections;
        importData.version = 3;
    }

    const importedRecords = Array.isArray(importData.innerButtonRecords)
        ? importData.innerButtonRecords.map((record) => normalizeInnerButtonRecord(record))
        : null;
    const importedExercises = Array.isArray(importData.customExercises)
        ? importData.customExercises
        : [];

    //console.log("Imported selections:", importData);

    if (!importedRecords) {
        return null;
    }

    if (importedRecords.some((record) => record === null) || importedExercises.some((exercise) => exercise === null)) {
        return null;
    }

    return {
        innerButtonRecords: importedRecords,
        customExercises: importedExercises,
    };
}

function applyImportedData(validatedData) {
    const { innerButtonRecords, customExercises } = validatedData;
    //console.log("Applying imported data:", { innerButtonRecords, customExercises });

    localStorage.setItem("inner-button-selections", JSON.stringify(innerButtonRecords));
    localStorage.setItem("custom-exercises", JSON.stringify(customExercises));


}

// Exercise Generation Functions

async function generateExercise(currentExerciseKey = null) {
    const storedRecords = getStoredInnerButtonRecords();
    const selectedExercises = storedRecords.filter(record => record.selected);

    if (selectedExercises.length === 0) {
        return {
            error: true,
            title: "No exercises selected. Please select at least one exercise in the settings."
        };
    }

    // Filter out the current exercise from the pool of selected exercises

    const exercisePool = currentExerciseKey ? selectedExercises.filter(record => record.key !== currentExerciseKey) : selectedExercises;


    if (exercisePool.length === 0) {
        exercisePool.push(...selectedExercises);
    }

    const selectedExercise = pickRandomWeightedExercise(exercisePool);

    if (!selectedExercise) {
        //console.error("No exercise could be selected from the pool:", exercisePool);
        return {
            error: true,
            title: "No exercises available. Please check your settings."
        };
    }

    if (selectedExercise.isCustomExercise) {
        //console.log("Searching for custom exercise with label:", selectedExercise.key);
        const customExercise = findCustomExerciseByLabel(selectedExercise.key);
        //console.log("Custom Exercise Found:", customExercise);
        if (!customExercise) {
            return {
                error: true,
                title: "Custom exercise data not found. Please check your settings."
            };
        }

        //console.log("Selected Exercise Data:", customExercise);
        return {
            error: false,
            title: customExercise.name,
            img_src: customExercise.image !== "" ? customExercise.image : null,
            instructions: customExercise.instructions,
            group: "Custom Exercises",
            subgroup: "",
            range: selectedExercise.range
        };
    }

    let selectedGroup = null;
    let selectedSubgroup = null;
    let selectedExerciseData = null;

    allExercises.forEach(group => {
        group.subgroups.forEach(subgroup => {
            subgroup.exercises.forEach(exercise => {
                if (exercise.label === selectedExercise.key) {
                    selectedGroup = group.label;
                    selectedSubgroup = subgroup.label;
                    selectedExerciseData = exercise;
                }
            });
        });
    });

    const selectedExerciseInstructions = await fetch("../../assets/md/warmups/" + selectedGroup.replace(/\s+/g, "_").trim().toLowerCase() + "/" + selectedExercise.key.replace(/\s+/g, "_").trim().toLowerCase() + ".md").then(response => response.text()).catch(() => "Instructions not found.");
    
    if (!selectedGroup || !selectedSubgroup || !selectedExerciseData) {
        return {
            error: true,
            title: "Exercise data not found."
        };
    }

    //console.log("Selected Exercise Data:", selectedExerciseData);
    //console.log("Selected Group:", selectedGroup);
    //console.log("Selected Subgroup:", selectedSubgroup);
    //console.log("Selected Exercise Instructions:", selectedExerciseInstructions);

    return {
        error: false,
        title: selectedExerciseData.label,
        img_src: selectedExerciseData.thumbnail,
        instructions: selectedExerciseInstructions,
        group: selectedGroup,
        subgroup: selectedSubgroup,
        range: selectedExercise.range
    };
}


function pickRandomWeightedExercise(exercisePool) {
    const convertRangetoWeight = (range) => {
        switch (range) {
            case 1:
                return 16;
            case 2:
                return 8;
            case 3:
                return 4;
            case 4:
                return 2;
            case 5:
                return 1;
            default:
                return 4;
        }
    }
    const weightedPool = exercisePool
        .map((exercise) => {
            if (exercise.range && typeof exercise.range === "string") {
                return {
                    exercise,
                    weight: exercise.range? convertRangetoWeight(parseInt(exercise.range, 10)) : 1
                };
            }
            return {
                exercise,
                weight: exercise.range? convertRangetoWeight(exercise.range) : 1
            };
        })
        .filter((entry) => entry.weight > 0);

    if (weightedPool.length === 0) {
        return null;
    }
    //console.log("Weighted Pool:", weightedPool);

    const totalWeight = weightedPool.reduce((sum, entry) => sum + entry.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const entry of weightedPool) {
        randomWeight -= entry.weight;

        if (randomWeight <= 0) {
            return entry.exercise;
        }
    }

    return weightedPool[weightedPool.length - 1].exercise;
}

function findCustomExerciseByLabel(label) {
    const normalizedLabel = typeof label === "string" ? label.trim() : "";
    
    if (!normalizedLabel) {
        return null;
    }
    
    const customExercises = getStoredCustomExercises();

    return customExercises.find((exercise) => {
        return exercise && typeof exercise === "object" && typeof exercise.name === "string"
            && exercise.name.trim() === normalizedLabel;
    }) || null;
}