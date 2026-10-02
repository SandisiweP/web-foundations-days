let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];


function searchNotes(word) {
    const query = word.toLowerCase();
    return notes.filter(note => note.text.toLowerCase().includes(query));
}

function longestNote() {
    if (notes.length === 0) return null;
    let longest = notes[0];
    for (let i = 1; i < notes.length; i++) {
        if (notes[i].text.length > longest.text.length) {
            longest = notes[i];
        }
    }
    return longest;
}

function countByCategory() {
    const counts = {};
    for (let note of notes) {
        if (counts[note.category]) {
            counts[note.category]++;
        } else {
            counts[note.category] = 1;
        }
    }
    return counts;
}

function getSummary() {
    const total = notes.length;
    const noteWord = total === 1 ? "note" : "notes";
    const counts = countByCategory();
    const parts = [];

    for (let cat in counts) {
        parts.push(`${counts[cat]} ${cat}`);
    }

    return `${total} ${noteWord}: ${parts.join(", ")}.`;
}

function isDuplicate(text) {
    const cleaned = text.trim().toLowerCase();
    return notes.some(note => note.text.trim().toLowerCase() === cleaned);
}

function addNote(text, category) {
    const cleaned = text ? text.trim() : "";
    const validCategories = ["personal", "work", "study"];

    if (cleaned.length < 1 || cleaned.length > 200) {
        console.log("Note rejected: text must be between 1 and 200 characters.");
        return false;
    }
    if (!validCategories.includes(category)) {
        console.log("Note rejected: category must be personal, work, or study.");
        return false;
    }
    if (isDuplicate(cleaned)) {
        console.log("Note rejected: duplicate note already exists.");
        return false;
    }

    const newNote = {
        id: Date.now(),
        text: cleaned,
        category: category
    };

    notes.push(newNote);
    console.log(`Added note: "${newNote.text}" (${newNote.category})`);
    return true;
}


console.log(searchNotes("study")); 
console.log(searchNotes("xyz"));   

console.log(longestNote());        

console.log(countByCategory());    

console.log(getSummary());         

console.log(isDuplicate("Call mum"));   
console.log(isDuplicate("Learn JS"));    

addNote("Review lecture notes", "study"); 
addNote("", "study"); 