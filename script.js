// Dark/Light mode toggle logic
const modeSwitch = document.getElementById('modeSwitch');
const body = document.body;

modeSwitch.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
});

// Render activities in the table
const activities = [
    {
        name: "Tomar banho",
        category: "Higiene",
        fields: [
            { type: "bool", key: "temp", options: ["quente", "frio"], value: "quente" },
            { type: "number", key: "minutes", label: "por", suffix: "minutos", value: 10 }
        ]
    },
    {
        name: "Flexão",
        category: "Exercício", 
        fields: [
            { type: "number", key: "sets", label: "", value: 3 },
            { type: "number", key: "reps", label: "sets de", value: "10",},
        ]
    },
    {
        name: "Passear com pet",
        category: "Pet",
        fields: [
            { type: "text", key: "petName", label: "com", size: "big", value: "", placeholder: "nome do pet" },
            { type: "number", key: "minutes", label: "por", suffix: "minutos", value: 10 }
        ]
    },
    {
        name: "Colocar ração",
        category: "Pet",
        fields: []
    },
    {
        name: "Lavar a louça",
        category: "Higiene", 
        fields: []
    },
    {
        name: "Colocar roupa para lavar",
        category: "Higiene",
        fields: [
            { type: "text", key: "option", label: "na Opção", size: "big", value: "", placeholder: "opção da maquina" }
        ]
    }
];

// Add this array to track scheduled activities
let scheduledActivities = [];

function renderActivities() {
    const list = document.getElementById('activities-list');
    const scrollTop = list.scrollTop;
    const activeElement = document.activeElement;
    
    list.innerHTML = "";
    activities.forEach((activity, idx) => {
        let t = (activity.time || '0000').slice(0, 4);
        const h1 = t[0], h2 = t[1], m1 = t[2], m2 = t[3];
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        let icon = `<div class='activity-icon' data-category="${activity.category}"></div>`;
        
        // First line: Activity name, icon, and add button
        let firstLine = `<div class='activity-row first-line'>${icon}<div class='activity-title'>${activity.name}</div><button class="add-to-list-btn" data-idx="${idx}"></button></div>`;
        
        // Second line: Activity inputs
        let secondLine = `<div class='activity-row second-line'>`;
        
        if (activity.fields && activity.fields.length > 0) {
            activity.fields.forEach(field => {
                if (field.type === "bool") {
                    secondLine += `<button class="toggle-btn${field.value === field.options[0] ? ' active' : ''}" data-idx="${idx}" data-key="${field.key}" data-value="${field.options[0]}">${field.options[0]}</button><button class="toggle-btn${field.value === field.options[1] ? ' active' : ''}" data-idx="${idx}" data-key="${field.key}" data-value="${field.options[1]}">${field.options[1]}</button>`;
                } else if (field.type === "number") {
                    if (field.label) secondLine += `<span>${field.label}</span>`;
                    secondLine += `<input type="number" min="1" class="field-input" data-idx="${idx}" data-key="${field.key}" value="${field.value}" style="width:${field.size === 'small' ? '2.2em' : '3em'};text-align:center;">`;
                    if (field.suffix) secondLine += `<span>${field.suffix}</span>`;
                } else if (field.type === "text") {
                    if (field.label) secondLine += `<span>${field.label}</span>`;
                    const readonlyAttr = field.readonly ? 'readonly' : '';
                    const placeholderAttr = field.placeholder ? `placeholder="${field.placeholder}"` : '';
                    secondLine += `<input type="text" class="field-input" data-idx="${idx}" data-key="${field.key}" value="${field.value}" style="width:${field.size === 'big' ? '120px' : '60px'};text-align:left;" ${readonlyAttr} ${placeholderAttr}>`;
                }
            });
        }
        
        secondLine += `</div>`;
        
        let thirdLine = `<div class='activity-row third-line'><span>Horário:</span><input type="text" maxlength="1" class="time-digit" data-idx="${idx}" data-pos="0" value="${h1}"><input type="text" maxlength="1" class="time-digit" data-idx="${idx}" data-pos="1" value="${h2}"><span class="time-sep">:</span><input type="text" maxlength="1" class="time-digit" data-idx="${idx}" data-pos="2" value="${m1}"><input type="text" maxlength="1" class="time-digit" data-idx="${idx}" data-pos="3" value="${m2}"></div>`;
        
        card.innerHTML = firstLine + secondLine + thirdLine;
        list.appendChild(card);
    });
    
    // Restore scroll position
    list.scrollTop = scrollTop;
    
    // Restore focus if it was on an input field
    if (activeElement && (activeElement.classList.contains('field-input') || activeElement.classList.contains('time-digit'))) {
        const idx = activeElement.getAttribute('data-idx');
        const key = activeElement.getAttribute('data-key');
        const pos = activeElement.getAttribute('data-pos');
        
        if (key) {
            // Field input
            const newInput = document.querySelector(`.field-input[data-idx="${idx}"][data-key="${key}"]`);
            if (newInput) {
                newInput.focus();
                if (newInput.type === 'text' && !newInput.readOnly) {
                    newInput.setSelectionRange(newInput.value.length, newInput.value.length);
                }
            }
        } else if (pos !== null) {
            // Time digit
            const newInput = document.querySelector(`.time-digit[data-idx="${idx}"][data-pos="${pos}"]`);
            if (newInput) {
                newInput.focus();
                newInput.setSelectionRange(1, 1);
            }
        }
    }
    
    const spacer = document.createElement('div');
    spacer.style.height = '40px';
    list.appendChild(spacer);
}

function renderHourList() {
    const hoursList = document.querySelector('.hours-list');
    
    // Clear existing items (keep the hour dividers)
    const hourDividers = hoursList.querySelectorAll('.hour-divider');
    hoursList.innerHTML = '';
    hourDividers.forEach(divider => {
        hoursList.appendChild(divider);
    });
    
    // Add scheduled activities to their respective hours
    scheduledActivities.forEach((scheduled, index) => {
        const hour = parseInt(scheduled.time.substring(0, 2));
        const hourDivider = hoursList.querySelectorAll('.hour-divider')[hour];
        
        if (hourDivider) {
            const item = document.createElement('div');
            item.className = 'hour-item';
            
            // Build interactive details from fields
            let detailsHTML = '';
            if (scheduled.activity.fields && scheduled.activity.fields.length > 0) {
                scheduled.activity.fields.forEach((field, fieldIndex) => {
                    if (field.type === "bool") {
                        detailsHTML += `
                            <div class="hour-item-field">
                                <button class="hour-item-toggle-btn ${field.value === field.options[0] ? 'active' : ''}" 
                                        data-index="${index}" data-field="${fieldIndex}" data-value="${field.options[0]}">
                                    ${field.options[0]}
                                </button>
                                <button class="hour-item-toggle-btn ${field.value === field.options[1] ? 'active' : ''}" 
                                        data-index="${index}" data-field="${fieldIndex}" data-value="${field.options[1]}">
                                    ${field.options[1]}
                                </button>
                            </div>
                        `;
                    } else if (field.type === "number") {
                        detailsHTML += `<div class="hour-item-field">`;
                        if (field.label) detailsHTML += `<span>${field.label}</span>`;
                        detailsHTML += `<input type="number" min="1" class="hour-item-input" 
                                              data-index="${index}" data-field="${fieldIndex}" 
                                              value="${field.value}" style="width:${field.size === 'small' ? '2em' : '2.5em'}">`;
                        if (field.suffix) detailsHTML += `<span>${field.suffix}</span>`;
                        detailsHTML += `</div>`;
                    } else if (field.type === "text") {
                        detailsHTML += `<div class="hour-item-field">`;
                        if (field.label) detailsHTML += `<span>${field.label}</span>`;
                        const readonlyAttr = field.readonly ? 'readonly' : '';
                        const placeholderAttr = field.placeholder ? `placeholder="${field.placeholder}"` : '';
                        detailsHTML += `<input type="text" class="hour-item-text-input" 
                                              data-index="${index}" data-field="${fieldIndex}" 
                                              value="${field.value}" ${readonlyAttr} ${placeholderAttr}>`;
                        detailsHTML += `</div>`;
                    }
                });
            }
            
            item.innerHTML = `
                <div class="hour-item-header">
                    <div class="hour-item-icon" data-category="${scheduled.activity.category}"></div>
                    <div class="hour-item-name">${scheduled.activity.name}</div>
                    <div class="hour-item-time">${scheduled.time.substring(0, 2)}:${scheduled.time.substring(2, 4)}</div>
                </div>
                ${detailsHTML ? `<div class="hour-item-details">${detailsHTML}</div>` : ''}
                <div class="hour-item-controls">
                    <button class="hour-item-btn earlier" data-index="${index}">-1h</button>
                    <button class="hour-item-btn later" data-index="${index}">+1h</button>
                    <button class="hour-item-btn remove" data-index="${index}">Remover</button>
                </div>
            `;
            
            // Insert after the hour divider
            hourDivider.parentNode.insertBefore(item, hourDivider.nextSibling);
        }
    });
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-btn')) {
        const idx = e.target.getAttribute('data-idx');
        const key = e.target.getAttribute('data-key');
        const value = e.target.getAttribute('data-value');
        
        // Update the field value
        const field = activities[idx].fields.find(f => f.key === key);
        if (field) {
            field.value = value;
        }
        renderActivities();
    }
    
    // Add to list button click
    if (e.target.classList.contains('add-to-list-btn')) {
        const idx = e.target.getAttribute('data-idx');
        const activity = activities[idx];
        
        if (activity.time && activity.time !== '0000') {
            // Create a deep copy of the activity
            const activityCopy = JSON.parse(JSON.stringify(activity));
            
            scheduledActivities.push({
                activity: activityCopy,
                time: activity.time,
                id: Date.now() + Math.random() // Unique ID
            });
            
            renderHourList();
        } else {
            alert('Por favor, defina um horário antes de adicionar à lista.');
        }
    }
    
    // Hour item toggle buttons
    if (e.target.classList.contains('hour-item-toggle-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const fieldIndex = parseInt(e.target.getAttribute('data-field'));
        const value = e.target.getAttribute('data-value');
        
        const scheduled = scheduledActivities[index];
        if (scheduled && scheduled.activity.fields[fieldIndex]) {
            scheduled.activity.fields[fieldIndex].value = value;
            renderHourList();
        }
    }
    
    // Hour item controls
    if (e.target.classList.contains('hour-item-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        
        if (e.target.classList.contains('earlier')) {
            // Move 1 hour earlier
            const scheduled = scheduledActivities[index];
            let hour = parseInt(scheduled.time.substring(0, 2));
            hour = (hour - 1 + 24) % 24; // Wrap around
            scheduled.time = hour.toString().padStart(2, '0') + scheduled.time.substring(2, 4);
            renderHourList();
            
        } else if (e.target.classList.contains('later')) {
            // Move 1 hour later
            const scheduled = scheduledActivities[index];
            let hour = parseInt(scheduled.time.substring(0, 2));
            hour = (hour + 1) % 24; // Wrap around
            scheduled.time = hour.toString().padStart(2, '0') + scheduled.time.substring(2, 4);
            renderHourList();
            
        } else if (e.target.classList.contains('remove')) {
            // Remove from list
            scheduledActivities.splice(index, 1);
            renderHourList();
        }
    }
});

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('field-input')) {
        const idx = e.target.getAttribute('data-idx');
        const key = e.target.getAttribute('data-key');
        const value = e.target.type === 'number' ? parseInt(e.target.value, 10) : e.target.value;
        
        const field = activities[idx].fields.find(f => f.key === key);
        if (field) {
            if (e.target.type === 'number') {
                field.value = isNaN(value) || value < 1 ? 1 : value;
            } else if (!e.target.readOnly) { // Only update if not readonly
                field.value = value;
            }
        }
        // Don't re-render on every input for text fields to maintain focus
        if (e.target.type === 'number') {
            renderActivities();
        }
    }
    
    if (e.target.classList.contains('time-digit')) {
        const idx = e.target.getAttribute('data-idx');
        const pos = parseInt(e.target.getAttribute('data-pos'), 10);
        let val = e.target.value.replace(/[^0-9]/g, '');
        // Restrict each digit
        if (pos === 0) {
            if (!/[0-2]/.test(val)) val = '0';
        } else if (pos === 1) {
            const h1 = document.querySelector(`input[data-idx='${idx}'][data-pos='0']`).value || '0';
            if (h1 === '2' && !/[0-3]/.test(val)) val = '0';
            else if (!/[0-9]/.test(val)) val = '0';
        } else if (pos === 2) {
            if (!/[0-5]/.test(val)) val = '0';
        } else if (pos === 3) {
            if (!/[0-9]/.test(val)) val = '0';
        }
        e.target.value = val;
        // Rebuild time string
        const digits = [0,1,2,3].map(i => {
            const inp = document.querySelector(`input[data-idx='${idx}'][data-pos='${i}']`);
            return inp && inp.value ? inp.value : '0';
        });
        activities[idx].time = digits.join('');
        
        // Auto-advance to next input
        if (val && pos < 3) {
            const nextInput = document.querySelector(`input[data-idx='${idx}'][data-pos='${pos + 1}']`);
            if (nextInput) {
                nextInput.focus();
                nextInput.setSelectionRange(1, 1);
            }
        }
    }
    
    if (e.target.classList.contains('hour-item-input')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const fieldIndex = parseInt(e.target.getAttribute('data-field'));
        const value = parseInt(e.target.value, 10);
        
        const scheduled = scheduledActivities[index];
        if (scheduled && scheduled.activity.fields[fieldIndex]) {
            scheduled.activity.fields[fieldIndex].value = isNaN(value) || value < 1 ? 1 : value;
        }
    }
    
    if (e.target.classList.contains('hour-item-text-input')) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const fieldIndex = parseInt(e.target.getAttribute('data-field'));
        const value = e.target.value;
        
        const scheduled = scheduledActivities[index];
        if (scheduled && scheduled.activity.fields[fieldIndex] && !scheduled.activity.fields[fieldIndex].readonly) {
            scheduled.activity.fields[fieldIndex].value = value;
        }
    }
});

// Only re-render on blur for text fields to maintain focus during typing
document.addEventListener('blur', function(e) {
    if (e.target.classList.contains('field-input') && e.target.type === 'text' && !e.target.readOnly) {
        const idx = e.target.getAttribute('data-idx');
        const key = e.target.getAttribute('data-key');
        const value = e.target.value;
        
        const field = activities[idx].fields.find(f => f.key === key);
        if (field) {
            field.value = value;
        }
    }
}, true);

// Initialize
renderActivities();