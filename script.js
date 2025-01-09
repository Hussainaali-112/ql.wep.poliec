// Initialize citizens data from local storage or use default data
let citizens = JSON.parse(localStorage.getItem('citizens')) || [];

// Military roles and their permissions
const roles = {
    'Police Chief': {
        canAddCitizen: true,
        canEditCitizen: true,
        canDeleteCitizen: true,
        canAddVehicle: true,
        canAddProperty: true,
        canAddPoliceReport: true
    },
    'Soldier': {
        canAddCitizen: false,
        canEditCitizen: false,
        canDeleteCitizen: false,
        canAddVehicle: true,
        canAddProperty: false,
        canAddPoliceReport: false
    }
};

// Current user
let currentUser = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const citizensList = document.getElementById('citizensList');
const editForm = document.getElementById('editForm');
const addCitizenBtn = document.getElementById('addCitizenBtn');
const userInfo = document.getElementById('userInfo');
let currentCitizenId = null;

// Car types and colors
const carTypes = ['Ford', 'Mustang', 'Mercedes', 'BMW', 'Toyota', 'Honda', 'Chevrolet', 'Audi'];
const carColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Yellow', 'Gray'];

// Initialize the application
function init() {
    if (localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        showMainApp();
    } else {
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
}

// Show main app
function showMainApp() {
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    userInfo.textContent = `${currentUser.name} (${currentUser.role})`;
    renderCitizens();
    setupEventListeners();
    updateUIBasedOnRole();
}

// Login function
function login() {
    const name = document.getElementById('militaryName').value;
    const code = document.getElementById('militaryCode').value;
    
    // In a real application, you would validate the credentials against a secure database
    // For this example, we'll use a simple check
    if (name && code === '1234') {
        currentUser = {
            name: name,
            role: name === 'James Arthur' ? 'Police Chief' : 'Soldier'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Invalid credentials');
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginScreen();
}

// Update UI based on user role
function updateUIBasedOnRole() {
    const userPermissions = roles[currentUser.role];
    addCitizenBtn.style.display = userPermissions.canAddCitizen ? 'block' : 'none';
    
    const propertySection = document.querySelector('.properties-section');
    propertySection.style.display = userPermissions.canAddProperty ? 'block' : 'none';

    const policeReportsSection = document.querySelector('.police-reports-section');
    policeReportsSection.style.display = userPermissions.canAddPoliceReport ? 'block' : 'none';
}

// Render all citizens
function renderCitizens() {
    citizensList.innerHTML = citizens.map(citizen => `
        <div class="citizen-card ${citizen.wanted ? 'wanted' : ''}">
            <img src="${citizen.photo}" alt="${citizen.name}" class="citizen-photo">
            <div class="citizen-info">
                <div><strong>NAME:</strong> ${citizen.name}</div>
                <div><strong>DATE OF BIRTH:</strong> ${citizen.birthDate}</div>
                <div><strong>BIRTH CITY:</strong> ${citizen.birthCity || 'N/A'}</div>
                <div><strong>AGE:</strong> ${citizen.age}</div>
                <div><strong>GENDER:</strong> ${citizen.gender}</div>
                <div><strong>NATIONALITY:</strong> ${citizen.nationality}</div>
                ${citizen.wanted ? '<div class="wanted-badge">WANTED</div>' : ''}
            </div>
            <button onclick="editCitizen(${citizen.id})" class="send-button">EDIT</button>
            ${roles[currentUser.role].canDeleteCitizen ? 
                `<button onclick="deleteCitizen(${citizen.id})" class="send-button">DELETE</button>` : 
                ''}
        </div>
    `).join('');
}

// Edit citizen
function editCitizen(id) {
    currentCitizenId = id;
    const citizen = citizens.find(c => c.id === id);
    if (!citizen) return;

    citizensList.classList.add('hidden');
    editForm.classList.remove('hidden');
    document.getElementById('formTitle').textContent = 'Edit Citizen';

    // Fill form with citizen data
    document.getElementById('personPhoto').src = citizen.photo;
    document.getElementById('name').value = citizen.name;
    document.getElementById('births').value = citizen.birthDate;
    document.getElementById('birthCity').value = citizen.birthCity || '';
    document.getElementById('age').value = citizen.age;
    document.getElementById('gender').value = citizen.gender;
    document.getElementById('nationality').value = citizen.nationality;
    document.getElementById('occupation').value = citizen.maritalStatus;
    document.getElementById('maritalStatus').value = citizen.job;

    renderVehicles(citizen.vehicles);
    renderProperties(citizen.properties);
    renderAdditionalInfo(citizen.additionalInfo);
    renderComments(citizen.comments);
    renderReports(citizen.reports);
    renderPoliceReports(citizen.policeReports || []);

    const wantedStatusBtn = document.getElementById('wantedStatusBtn');
    wantedStatusBtn.textContent = citizen.wanted ? 'Remove Wanted Status' : 'Mark as Wanted';
    wantedStatusBtn.classList.toggle('wanted-btn', citizen.wanted);

    updateCarUsedOptions(citizen.vehicles);
}

// Add new citizen
function addNewCitizen() {
    if (!roles[currentUser.role].canAddCitizen) {
        alert('You do not have permission to add new citizens.');
        return;
    }

    currentCitizenId = null;
    citizensList.classList.add('hidden');
    editForm.classList.remove('hidden');
    document.getElementById('formTitle').textContent = 'Add New Citizen';

    // Clear form fields
    document.getElementById('personPhoto').src = 'placeholder.svg';
    document.getElementById('name').value = '';
    document.getElementById('births').value = '';
    document.getElementById('birthCity').value = '';
    document.getElementById('age').value = '';
    document.getElementById('gender').value = 'male';
    document.getElementById('maritalStatus').value = 'CHOOSE THE JOB';

    renderVehicles([]);
    renderProperties([]);
    renderAdditionalInfo({});
    renderComments([]);
    renderPoliceReports([]);

    const wantedStatusBtn = document.getElementById('wantedStatusBtn');
    wantedStatusBtn.textContent = 'Mark as Wanted';
    wantedStatusBtn.classList.remove('wanted-btn');

    updateCarUsedOptions([]);
}

// Delete citizen
function deleteCitizen(id) {
    if (!roles[currentUser.role].canDeleteCitizen) {
        alert('You do not have permission to delete citizens.');
        return;
    }

    if (confirm('Are you sure you want to delete this citizen?')) {
        citizens = citizens.filter(c => c.id !== id);
        saveToLocalStorage();
        renderCitizens();
    }
}

// Render vehicles
function renderVehicles(vehicles) {
    const vehiclesList = document.getElementById('vehiclesList');
    vehiclesList.innerHTML = vehicles.map((vehicle, index) => `
        <div class="vehicle-card">
            <img src="${vehicle.image || `car-icons/${vehicle.type.toLowerCase()}.svg`}" alt="${vehicle.type}" class="vehicle-image">
            <div class="vehicle-name">${vehicle.type}</div>
            <div class="vehicle-info">
                <div>Plate: ${vehicle.plateNumber}</div>
                <div>Color: ${vehicle.color}</div>
            </div>
            <div class="vehicle-actions">
                <button onclick="editVehicle(${index})" class="edit-btn">Edit</button>
                <button onclick="deleteVehicle(${index})" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Show car options
function showCarOptions() {
    const carOptions = document.getElementById('carOptions');
    carOptions.classList.remove('hidden');
    const carTypeButtons = document.getElementById('carTypeButtons');
    carTypeButtons.innerHTML = carTypes.map(type => `
        <button onclick="selectCarType('${type}')" class="car-type-btn">
            <img src="car-icons/${type.toLowerCase()}.svg" alt="${type}" class="car-icon">
            <span>${type}</span>
        </button>
    `).join('');
}

// Select car type
function selectCarType(type) {
    document.getElementById('vehicleType').value = type;
    document.getElementById('addVehicleForm').classList.remove('hidden');
    document.getElementById('carOptions').classList.add('hidden');
    
    // Populate color options
    const colorOptions = document.getElementById('colorOptions');
    colorOptions.innerHTML = carColors.map(color => `
        <button onclick="selectColor('${color}')" class="color-btn" style="background-color: ${color.toLowerCase()};">
            <span class="sr-only">${color}</span>
        </button>
    `).join('');
}

// Select color
function selectColor(color) {
    document.getElementById('vehicleColor').value = color;
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.closest('.color-btn').classList.add('selected');
}

// Add vehicle
function addVehicle() {
    if (!roles[currentUser.role].canAddVehicle) {
        alert('You do not have permission to add vehicles.');
        return;
    }

    document.getElementById('addVehicleForm').classList.remove('hidden');
}

// Add this function to handle adding new vehicles
function submitVehicle() {
    const type = document.getElementById('vehicleType').value;
    const plateNumber = document.getElementById('plateNumber').value;
    const color = document.getElementById('vehicleColor').value;

    if (!type || !plateNumber || !color) {
        alert('Please fill in all vehicle details.');
        return;
    }

    const newVehicle = { type, plateNumber, color };
    addVehicleToCurrentCitizen(newVehicle);
    
    // Clear the form
    document.getElementById('vehicleType').value = '';
    document.getElementById('plateNumber').value = '';
    document.getElementById('vehicleColor').value = '';
    
    // Hide the form
    document.getElementById('addVehicleForm').classList.add('hidden');
}

function addVehicleToCurrentCitizen(vehicle) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen) {
        if (!citizen.vehicles) {
            citizen.vehicles = [];
        }
        citizen.vehicles.push(vehicle);
        renderVehicles(citizen.vehicles);
        document.getElementById('addVehicleForm').classList.add('hidden');
        document.getElementById('vehicleType').value = '';
        document.getElementById('plateNumber').value = '';
        document.getElementById('vehicleColor').value = '';
        document.getElementById('vehicleImage').value = '';
        saveToLocalStorage();
        updateCarUsedOptions(citizen.vehicles);
    }
}

// Edit vehicle
function editVehicle(index) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.vehicles[index]) {
        const vehicle = citizen.vehicles[index];
        document.getElementById('vehicleType').value = vehicle.type;
        document.getElementById('plateNumber').value = vehicle.plateNumber;
        selectColor(vehicle.color);
        document.getElementById('addVehicleForm').classList.remove('hidden');
        
        // Change add button to update
        const addButton = document.querySelector('#addVehicleForm button');
        addButton.textContent = 'Update Vehicle';
        addButton.onclick = () => updateVehicle(index);
    }
}

// Update vehicle
function updateVehicle(index) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.vehicles[index]) {
        const type = document.getElementById('vehicleType').value;
        const plateNumber = document.getElementById('plateNumber').value;
        const color = document.getElementById('vehicleColor').value;

        if (!type || !plateNumber || !color) {
            alert('Please fill in all vehicle details.');
            return;
        }

        citizen.vehicles[index] = { ...citizen.vehicles[index], type, plateNumber, color };
        renderVehicles(citizen.vehicles);
        saveToLocalStorage();
        updateCarUsedOptions(citizen.vehicles);

        document.getElementById('addVehicleForm').classList.add('hidden');
        
        // Reset add button
        const addButton = document.querySelector('#addVehicleForm button');
        addButton.textContent = 'Add Vehicle';
        addButton.onclick = addVehicle;
    }
}

// Show vehicle details
function showVehicleDetails(index) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.vehicles[index]) {
        const vehicle = citizen.vehicles[index];
        alert(`
            Type: ${vehicle.type}
            License Plate: ${vehicle.plateNumber}
            Color: ${vehicle.color}
        `);
    }
}

// Delete vehicle
function deleteVehicle(index) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.vehicles) {
        citizen.vehicles.splice(index, 1);
        renderVehicles(citizen.vehicles);
        saveToLocalStorage();
        updateCarUsedOptions(citizen.vehicles);
    }
}

// Toggle wanted status
function toggleWantedStatus() {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen) {
        citizen.wanted = !citizen.wanted;
        const wantedStatusBtn = document.getElementById('wantedStatusBtn');
        wantedStatusBtn.textContent = citizen.wanted ? 'Remove Wanted Status' : 'Mark as Wanted';
        wantedStatusBtn.classList.toggle('wanted-btn', citizen.wanted);
        saveToLocalStorage();
    }
}

// Render police reports
function renderPoliceReports(reports) {
    const policeReportsContainer = document.getElementById('policeReports');
    policeReportsContainer.innerHTML = reports.map((report, index) => `
        <div class="police-report">
            <div class="report-text">
                <strong>Theft Type:</strong> ${report.theftType}<br>
                <strong>Fine:</strong> $${report.fine}<br>
                <strong>Car Used:</strong> ${report.carUsed}<br>
                <strong>Evidence Photos:</strong><br>
                <div class="evidence-photos">
                    ${report.evidencePhotos.map(photo => `<img src="${photo}" alt="Evidence" class="evidence-photo">`).join('')}
                </div>
                <strong>Details:</strong> ${report.text}
            </div>
            <div class="report-meta">
                <span>${report.author}</span> • 
                <span>${new Date(report.timestamp).toLocaleString()}</span>
                <button onclick="deletePoliceReport(${index})" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Add police report
function addPoliceReport() {
    if (!roles[currentUser.role].canAddPoliceReport) {
        alert('You do not have permission to add police reports.');
        return;
    }

    const theftType = document.getElementById('theftType').value;
    const fine = document.getElementById('fine').value;
    const carUsed = document.getElementById('carUsed').value;
    const evidencePhotos = document.getElementById('evidencePhotos').files;
    const reportText = document.getElementById('policeReportText').value;

    if (!theftType || !fine || !carUsed || evidencePhotos.length === 0 || !reportText) {
        alert('Please fill in all fields for the police report.');
        return;
    }

    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen) {
        if (!citizen.policeReports) {
            citizen.policeReports = [];
        }

        const newReport = {
            theftType: theftType,
            fine: parseFloat(fine),
            carUsed: carUsed,
            evidencePhotos: [],
            text: reportText,
            author: currentUser.name,
            timestamp: new Date().toISOString()
        };

        // Process evidence photos
        const photoPromises = Array.from(evidencePhotos).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(photoPromises).then(photoDataUrls => {
            newReport.evidencePhotos = photoDataUrls;
            citizen.policeReports.push(newReport);
            renderPoliceReports(citizen.policeReports);
            document.getElementById('theftType').value = '';
            document.getElementById('fine').value = '';
            document.getElementById('carUsed').value = '';
            document.getElementById('evidencePhotos').value = '';
            document.getElementById('policeReportText').value = '';
            document.getElementById('evidencePreview').innerHTML = '';
            saveToLocalStorage();
        });
    }
}

// Delete police report
function deletePoliceReport(index) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.policeReports) {
        citizen.policeReports.splice(index, 1);
        renderPoliceReports(citizen.policeReports);
        saveToLocalStorage();
    }
}

// Update car used options
function updateCarUsedOptions(vehicles) {
    const carUsedSelect = document.getElementById('carUsed');
    carUsedSelect.innerHTML = '<option value="">Select Car Used</option>' + 
        vehicles.map(vehicle => `<option value="${vehicle.type} - ${vehicle.plateNumber}">${vehicle.type} - ${vehicle.plateNumber}</option>`).join('');
}

// Preview evidence photos
function previewEvidencePhotos() {
    const evidencePhotos = document.getElementById('evidencePhotos').files;
    const evidencePreview = document.getElementById('evidencePreview');
    evidencePreview.innerHTML = '';

    Array.from(evidencePhotos).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('evidence-preview-photo');
            evidencePreview.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
}

// Save to local storage
function saveToLocalStorage() {
    console.log('Saving citizens:', citizens);
    localStorage.setItem('citizens', JSON.stringify(citizens));
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('evidencePhotos').addEventListener('change', previewEvidencePhotos);
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init);

// Render properties
function renderProperties(properties) {
    const propertiesList = document.getElementById('propertiesList');
    propertiesList.innerHTML = properties.map((property, index) => `
        <div class="property-item">
            <div>${property.type === 'partner' ? 'Partner' : property.type} in ${property.city}</div>
            ${property.type === 'partner' 
                ? `<div>Name: ${property.name}, Relation: ${property.relation}</div>`
                : `<div>Street: ${property.street}, Plot Number: ${property.plotNumber}</div>`
            }
            <div class="property-images">
                ${property.images.map(image => `
                    <img src="${image}" alt="Property image">
                `).join('')}
            </div>
            <button onclick="editProperty(${index})" class="edit-btn">Edit</button>
            <button onclick="deleteProperty(${index})" class="delete-btn">Delete</button>
        </div>
    `).join('');
}

// Add property
function addProperty() {
    if (!roles[currentUser.role].canAddProperty) {
        alert('You do not have permission to add properties.');
        return;
    }

    const city = document.getElementById('propertyCity').value;
    const type = document.getElementById('propertyType').value;
    const landNumber = document.getElementById('propertyLandNumber').value;
    const imageInput = document.getElementById('propertyImages');
    
    if (!city || !type || !landNumber) {
        alert('Please fill in all property details.');
        return;
    }

    const newProperty = { city, type, landNumber, images: [] };
    
    if (imageInput.files.length > 0) {
        Array.from(imageInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                newProperty.images.push(e.target.result);
                if (newProperty.images.length === imageInput.files.length) {
                    addPropertyToCurrentCitizen(newProperty);
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        addPropertyToCurrentCitizen(newProperty);
    }
}

function showPropertyOptions() {
    document.getElementById('propertyOptions').classList.remove('hidden');
}

function showPropertyForm() {
    const propertyType = document.getElementById('propertyTypeSelect').value;
    const formContainer = document.getElementById('propertyFormContainer');
    formContainer.innerHTML = '';
    formContainer.classList.remove('hidden');

    let formHTML = `
        <h4>Add ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}</h4>
        <div class="input-group">
            <label for="propertyCity">City:</label>
            <select id="propertyCity" name="propertyCity">
                <option value="Los Santos">Los Santos</option>
                <option value="Sandy Shore">Sandy Shore</option>
                <option value="Bolito">Bolito</option>
            </select>
        </div>
    `;

    if (propertyType === 'house' || propertyType === 'apartment') {
        formHTML += `
            <div class="input-group">
                <label for="propertyStreet">Street:</label>
                <select id="propertyStreet" name="propertyStreet">
                    <option value="Grove Street">Grove Street</option>
                    <option value="Vinewood Boulevard">Vinewood Boulevard</option>
                    <option value="Mirror Park">Mirror Park</option>
                </select>
            </div>
            <div class="input-group">
                <label for="propertyPlotNumber">Plot Number:</label>
                <input type="text" id="propertyPlotNumber" name="propertyPlotNumber">
            </div>
        `;
    } else if (propertyType === 'partner') {
        formHTML += `
            <div class="input-group">
                <label for="partnerName">Partner Name:</label>
                <input type="text" id="partnerName" name="partnerName">
            </div>
            <div class="input-group">
                <label for="partnerRelation">Relation:</label>
                <input type="text" id="partnerRelation" name="partnerRelation">
            </div>
        `;
    }

    formHTML += `
        <div class="input-group">
            <label for="propertyImages">Images:</label>
            <input type="file" id="propertyImages" name="propertyImages" accept="image/*" multiple>
        </div>
        <button onclick="submitProperty()" class="send-button">Add ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}</button>
    `;

    formContainer.innerHTML = formHTML;
}

function submitProperty() {
    const propertyType = document.getElementById('propertyTypeSelect').value;
    const city = document.getElementById('propertyCity').value;
    const images = document.getElementById('propertyImages').files;

    let newProperty = {
        type: propertyType,
        city: city,
        images: []
    };

    if (propertyType === 'house' || propertyType === 'apartment') {
        newProperty.street = document.getElementById('propertyStreet').value;
        newProperty.plotNumber = document.getElementById('propertyPlotNumber').value;
    } else if (propertyType === 'partner') {
        newProperty.name = document.getElementById('partnerName').value;
        newProperty.relation = document.getElementById('partnerRelation').value;
    }

    // Process images
    if (images.length > 0) {
        Array.from(images).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                newProperty.images.push(e.target.result);
                if (newProperty.images.length === images.length) {
                    addPropertyToCurrentCitizen(newProperty);
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        addPropertyToCurrentCitizen(newProperty);
    }
}

function addPropertyToCurrentCitizen(property) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen) {
        if (!citizen.properties) {
            citizen.properties = [];
        }
        citizen.properties.push(property);
        renderProperties(citizen.properties);
        document.getElementById('addPropertyForm').classList.add('hidden');
        saveToLocalStorage();
    }
}

// Edit property
function editProperty(index) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.properties[index]) {
        const property = citizen.properties[index];
        document.getElementById('propertyCity').value = property.city;
        document.getElementById('propertyType').value = property.type;
        document.getElementById('propertyLandNumber').value = property.landNumber;
        document.getElementById('addPropertyForm').classList.remove('hidden');
        
        // Change add button to update
        const addButton = document.querySelector('#addPropertyForm button');
        addButton.textContent = 'Update Property';
        addButton.onclick = () => updateProperty(index);
    }
}

// Update property
function updateProperty(index) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.properties[index]) {
        const city = document.getElementById('propertyCity').value;
        const type = document.getElementById('propertyType').value;
        const landNumber = document.getElementById('propertyLandNumber').value;
        const imageInput = document.getElementById('propertyImages');

        if (!city || !type || !landNumber) {
            alert('Please fill in all property details.');
            return;
        }

        citizen.properties[index] = { ...citizen.properties[index], city, type, landNumber };

        if (imageInput.files.length > 0) {
            citizen.properties[index].images = [];
            Array.from(imageInput.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    citizen.properties[index].images.push(e.target.result);
                    if (citizen.properties[index].images.length === imageInput.files.length) {
                        renderProperties(citizen.properties);
                        saveToLocalStorage();
                    }
                };
                reader.readAsDataURL(file);
            });
        } else {
            renderProperties(citizen.properties);
            saveToLocalStorage();
        }

        document.getElementById('addPropertyForm').classList.add('hidden');
        
        // Reset add button
        const addButton = document.querySelector('#addPropertyForm button');
        addButton.textContent = 'Add Property';
        addButton.onclick = addProperty;
    }
}

// Delete property
function deleteProperty(index) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.properties) {
        citizen.properties.splice(index, 1);
        renderProperties(citizen.properties);
        saveToLocalStorage();
    }
}

// Render additional info
function renderAdditionalInfo(additionalInfo) {
    const additionalInfoList = document.getElementById('additionalInfoList');
    additionalInfoList.innerHTML = Object.entries(additionalInfo || {}).map(([key, value]) => `
        <div class="additional-info-item">
            <span><strong>${key}:</strong> ${value}</span>
            <button onclick="removeAdditionalInfo('${key}')" class="delete-btn">&times;</button>
        </div>
    `).join('');
}

// Add additional info
function addAdditionalInfo() {
    const key = document.getElementById('infoKey').value.trim();
    const value = document.getElementById('infoValue').value.trim();
    if (key && value) {
        const citizen = citizens.find(c => c.id === currentCitizenId);
        if (citizen) {
            if (!citizen.additionalInfo) {
                citizen.additionalInfo = {};
            }
            citizen.additionalInfo[key] = value;
            renderAdditionalInfo(citizen.additionalInfo);
            document.getElementById('infoKey').value = '';
            document.getElementById('infoValue').value = '';
            saveToLocalStorage();
        }
    }
}

// Remove additional info
function removeAdditionalInfo(key) {
    const citizen = citizens.find(c => c.id === currentCitizenId);
    if (citizen && citizen.additionalInfo && citizen.additionalInfo[key]) {
        delete citizen.additionalInfo[key];
        renderAdditionalInfo(citizen.additionalInfo);
        saveToLocalStorage();
    }
}

// Render comments
function renderComments(comments) {
    const commentsContainer = document.getElementById('comments');
    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-text">${comment.text}</div>
            <div class="comment-meta">
                <span>${comment.author}</span> • 
                <span>${new Date(comment.timestamp).toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}

// Add comment
function addComment() {
    const commentText = document.getElementById('commentText').value;
    if (commentText) {
        const citizen = citizens.find(c => c.id === currentCitizenId);
        if (citizen) {
            if (!citizen.comments) {
                citizen.comments = [];
            }
            citizen.comments.push({
                text: commentText,
                author: currentUser.name,
                timestamp: new Date().toISOString()
            });
            renderComments(citizen.comments);
            document.getElementById('commentText').value = '';
            saveToLocalStorage();
        }
    }
}

// Render reports
function renderReports(reports) {
    const reportsContainer = document.getElementById('reports');
    reportsContainer.innerHTML = reports.map(report => `
        <div class="report">${report}</div>
    `).join('');
}

// Add report
function addReport() {
    const reportText = document.getElementById('reportText').value;
    if (reportText) {
        const citizen = citizens.find(c => c.id === currentCitizenId);
        if (citizen) {
            if (!citizen.reports) {
                citizen.reports = [];
            }
            citizen.reports.push(reportText);
            renderReports(citizen.reports);
            document.getElementById('reportText').value = '';
            saveToLocalStorage();
        }
    }
}

// Save citizen
function saveCitizen() {
    if (!roles[currentUser.role].canEditCitizen && currentCitizenId) {
        alert('You do not have permission to edit citizens.');
        return;
    }

    const citizen = currentCitizenId ? citizens.find(c => c.id === currentCitizenId) : { id: Date.now() };
    if (citizen) {
        citizen.name = document.getElementById('name').value;
        citizen.birthDate = document.getElementById('births').value;
        citizen.birthCity = document.getElementById('birthCity').value;
        citizen.age = document.getElementById('age').value;
        citizen.gender = document.getElementById('gender').value;
        citizen.job = document.getElementById('maritalStatus').value;
        citizen.photo = document.getElementById('personPhoto').src;
        citizen.wanted = document.getElementById('wantedStatusBtn').textContent === 'Remove Wanted Status';

        // Ensure properties are initialized
        if (!citizen.properties) citizen.properties = [];
        if (!citizen.vehicles) citizen.vehicles = [];

        if (!currentCitizenId) {
            citizens.push(citizen);
        }
        
        saveToLocalStorage();
        renderCitizens();
        cancelEdit();
    }
}

// Cancel edit
function cancelEdit() {
    currentCitizenId = null;
    editForm.classList.add('hidden');
    citizensList.classList.remove('hidden');
}





// ... (previous code remains unchanged)

// Add new citizen
function addNewCitizen() {
    if (!roles[currentUser.role].canAddCitizen) {
        alert('You do not have permission to add new citizens.');
        return;
    }

    const newCitizen = {
        id: Date.now(),
        name: 'New Citizen',
        birthDate: '',
        birthCity: '',
        age: '',
        gender: 'male',
        nationality: '',
        occupation: '',
        maritalStatus: 'single',
        photo: 'placeholder.svg',
        wanted: false,
        vehicles: [],
        properties: [],
        additionalInfo: {},
        comments: [],
        reports: [],
        policeReports: []
    };

    citizens.push(newCitizen);
    saveToLocalStorage();
    renderCitizens();
    editCitizen(newCitizen.id);
}

// Modify the existing addCitizenBtn click event listener
document.getElementById('addCitizenBtn').addEventListener('click', addNewCitizen);

// ... (rest of the code remains unchanged)








function saveCitizen() {
    // Validate input fields
    const name = document.getElementById('name').value.trim();
    const birthDate = document.getElementById('births').value;
    const birthCity = document.getElementById('birthCity').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;

    if (!name) {
        alert("Name cannot be empty.");
        return;
    }

    if (!birthDate) {
        alert("Date of birth cannot be empty.");
        return;
    }

    if (!birthCity) {
        alert("Birth city cannot be empty.");
        return;
    }

    if (!age || age <= 0) {
        alert("Age must be a positive number.");
        return;
    }

    if (!gender) {
        alert("Gender must be selected.");
        return;
    }

    // Proceed with saving if all fields are valid
    const citizen = currentCitizenId ? citizens.find(c => c.id === currentCitizenId) : { id: Date.now() };
    if (citizen) {
        citizen.name = name;
        citizen.birthDate = birthDate;
        citizen.birthCity = birthCity;
        citizen.age = age;
        citizen.gender = gender;
        citizen.photo = document.getElementById('personPhoto').src;
        citizen.wanted = document.getElementById('wantedStatusBtn').textContent === 'Remove Wanted Status';

        // Ensure properties and vehicles are initialized
        if (!citizen.properties) citizen.properties = [];
        if (!citizen.vehicles) citizen.vehicles = [];

        if (!currentCitizenId) {
            citizens.push(citizen);
        }

        saveToLocalStorage();
        renderCitizens();
        cancelEdit();
    }
}

































// Update the submitVehicle function to handle the car image
function submitVehicle() {
    const type = document.getElementById('vehicleType').value;
    const plateNumber = document.getElementById('plateNumber').value;
    const color = document.getElementById('vehicleColor').value;
    const carImageInput = document.getElementById('vehicleImage');

    if (!type || !plateNumber || !color || carImageInput.files.length === 0) {
        alert('Please fill in all vehicle details and upload a car image.');
        return;
    }

    // Read the uploaded car image
    const reader = new FileReader();
    reader.onload = function (e) {
        const newVehicle = {
            type,
            plateNumber,
            color,
            image: e.target.result, // Store the image as a Base64 string
        };
        addVehicleToCurrentCitizen(newVehicle);
    };
    reader.readAsDataURL(carImageInput.files[0]);

    // Clear the form
    document.getElementById('vehicleType').value = '';
    document.getElementById('plateNumber').value = '';
    document.getElementById('vehicleColor').value = '';
    carImageInput.value = '';

    // Hide the form
    document.getElementById('addVehicleForm').classList.add('hidden');
}

// Update the renderVehicles function to include the car image
function renderVehicles(vehicles) {
    const vehiclesList = document.getElementById('vehiclesList');
    vehiclesList.innerHTML = vehicles.map((vehicle, index) => `
        <div class="vehicle-card">
            <img src="${vehicle.image}" alt="${vehicle.type}" class="vehicle-image">
            <div class="vehicle-name">${vehicle.type}</div>
            <div class="vehicle-info">
                <div>Plate: ${vehicle.plateNumber}</div>
                <div>Color: ${vehicle.color}</div>
            </div>
            <div class="vehicle-actions">
                <button onclick="editVehicle(${index})" class="edit-btn">Edit</button>
                <button onclick="deleteVehicle(${index})" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update the renderCitizens function to include citizen photos
function renderCitizens() {
    citizensList.innerHTML = citizens.map(citizen => `
        <div class="citizen-card ${citizen.wanted ? 'wanted' : ''}">
            <img src="${citizen.photo}" alt="${citizen.name}" class="citizen-photo">
            <div class="citizen-info">
                <div><strong>NAME:</strong> ${citizen.name}</div>
                <div><strong>DATE OF BIRTH:</strong> ${citizen.birthDate}</div>
                <div><strong>BIRTH CITY:</strong> ${citizen.birthCity || 'N/A'}</div>
                <div><strong>AGE:</strong> ${citizen.age}</div>
                <div><strong>GENDER:</strong> ${citizen.gender}</div>
                <div><strong>NATIONALITY:</strong> ${citizen.nationality}</div>
                ${citizen.wanted ? '<div class="wanted-badge">WANTED</div>' : ''}
            </div>
            <button onclick="editCitizen(${citizen.id})" class="send-button">EDIT</button>
            ${roles[currentUser.role].canDeleteCitizen ? 
                `<button onclick="deleteCitizen(${citizen.id})" class="send-button">DELETE</button>` : 
                ''}
        </div>
    `).join('');
}

// Modify the citizen form to allow uploading a photo
function addNewCitizen() {
    if (!roles[currentUser.role].canAddCitizen) {
        alert('You do not have permission to add new citizens.');
        return;
    }

    currentCitizenId = null;
    citizensList.classList.add('hidden');
    editForm.classList.remove('hidden');
    document.getElementById('formTitle').textContent = 'Add New Citizen';

    // Clear form fields
    document.getElementById('personPhoto').src = 'placeholder.svg';
    document.getElementById('name').value = '';
    document.getElementById('births').value = '';
    document.getElementById('birthCity').value = '';
    document.getElementById('age').value = '';
    document.getElementById('gender').value = 'male';
    document.getElementById('maritalStatus').value = 'CHOOSE THE JOB';

    renderVehicles([]);
    renderProperties([]);
    renderAdditionalInfo({});
    renderComments([]);
    renderPoliceReports([]);

    const wantedStatusBtn = document.getElementById('wantedStatusBtn');
    wantedStatusBtn.textContent = 'Mark as Wanted';
    wantedStatusBtn.classList.remove('wanted-btn');

    updateCarUsedOptions([]);
}

// Add citizen photo upload handling
function handleCitizenPhotoUpload(input) {
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('personPhoto').src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
}

// Add this in HTML where the photo input exists:
// <input type="file" id="photoInput" accept="image/*" onchange="handleCitizenPhotoUpload(this)">


























// Update the submitVehicle function to handle the car image
function submitVehicle() {
    const type = document.getElementById('vehicleType').value;
    const plateNumber = document.getElementById('plateNumber').value;
    const color = document.getElementById('vehicleColor').value;
    const carImageInput = document.getElementById('vehicleImage');

    if (!type || !plateNumber || !color || carImageInput.files.length === 0) {
        alert('Please fill in all vehicle details and upload a car image.');
        return;
    }

    // Read the uploaded car image
    const reader = new FileReader();
    reader.onload = function (e) {
        const newVehicle = {
            type,
            plateNumber,
            color,
            image: e.target.result, // Store the image as a Base64 string
        };
        addVehicleToCurrentCitizen(newVehicle);
    };
    reader.readAsDataURL(carImageInput.files[0]);

    // Clear the form
    document.getElementById('vehicleType').value = '';
    document.getElementById('plateNumber').value = '';
    document.getElementById('vehicleColor').value = '';
    carImageInput.value = '';

    // Hide the form
    document.getElementById('addVehicleForm').classList.add('hidden');
}

// Update the renderVehicles function to include the car image
function renderVehicles(vehicles) {
    const vehiclesList = document.getElementById('vehiclesList');
    vehiclesList.innerHTML = vehicles.map((vehicle, index) => `
        <div class="vehicle-card">
            <img src="${vehicle.image}" alt="${vehicle.type}" class="vehicle-image">
            <div class="vehicle-name">${vehicle.type}</div>
            <div class="vehicle-info">
                <div>Plate: ${vehicle.plateNumber}</div>
                <div>Color: ${vehicle.color}</div>
            </div>
            <div class="vehicle-actions">
                <button onclick="editVehicle(${index})" class="edit-btn">Edit</button>
                <button onclick="deleteVehicle(${index})" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update the renderCitizens function to include citizen photos
function renderCitizens() {
    citizensList.innerHTML = citizens.map(citizen => `
        <div class="citizen-card ${citizen.wanted ? 'wanted' : ''} ${citizen.servicesStopped ? 'services-stopped' : ''}">
            <img src="${citizen.photo}" alt="${citizen.name}" class="citizen-photo">
            <div class="citizen-info">
                <div><strong>NAME:</strong> ${citizen.name}</div>
                <div><strong>DATE OF BIRTH:</strong> ${citizen.birthDate}</div>
                <div><strong>BIRTH CITY:</strong> ${citizen.birthCity || 'N/A'}</div>
                <div><strong>AGE:</strong> ${citizen.age}</div>
                <div><strong>GENDER:</strong> ${citizen.gender}</div>
                <div><strong>NATIONALITY:</strong> ${citizen.nationality}</div>
                ${citizen.wanted ? '<div class="wanted-badge">WANTED</div>' : ''}
                ${citizen.servicesStopped ? '<div class="stopped-badge">SERVICES STOPPED</div>' : ''}
            </div>
            <button onclick="editCitizen(${citizen.id})" class="send-button">EDIT</button>
            ${roles[currentUser.role].canDeleteCitizen ? 
                `<button onclick="deleteCitizen(${citizen.id})" class="send-button">DELETE</button>` : 
                ''}
            <button onclick="toggleServices(${citizen.id})" class="send-button">
                ${citizen.servicesStopped ? 'Resume Services' : 'Stop Services'}
            </button>
        </div>
    `).join('');
}

// Add functionality to toggle services
function toggleServices(citizenId) {
    const citizen = citizens.find(c => c.id === citizenId);
    if (citizen) {
        citizen.servicesStopped = !citizen.servicesStopped;
        saveToLocalStorage();
        renderCitizens();
    }
}

// Modify the citizen form to allow uploading a photo
function addNewCitizen() {
    if (!roles[currentUser.role].canAddCitizen) {
        alert('You do not have permission to add new citizens.');
        return;
    }

    currentCitizenId = null;
    citizensList.classList.add('hidden');
    editForm.classList.remove('hidden');
    document.getElementById('formTitle').textContent = 'Add New Citizen';

    // Clear form fields
    document.getElementById('personPhoto').src = 'placeholder.svg';
    document.getElementById('name').value = '';
    document.getElementById('births').value = '';
    document.getElementById('birthCity').value = '';
    document.getElementById('age').value = '';
    document.getElementById('gender').value = 'male';
    document.getElementById('maritalStatus').value = 'CHOOSE THE JOB';

    renderVehicles([]);
    renderProperties([]);
    renderAdditionalInfo({});
    renderComments([]);
    renderPoliceReports([]);

    const wantedStatusBtn = document.getElementById('wantedStatusBtn');
    wantedStatusBtn.textContent = 'Mark as Wanted';
    wantedStatusBtn.classList.remove('wanted-btn');

    updateCarUsedOptions([]);
}

// Add citizen photo upload handling
function handleCitizenPhotoUpload(input) {
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('personPhoto').src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
}

// Add this in HTML where the photo input exists:
// <input type="file" id="photoInput" accept="image/*" onchange="handleCitizenPhotoUpload(this)">







const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', message => {
        // Broadcast the message to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});








const socket = new WebSocket('ws://localhost:8080');

// Send updates to the server when a new citizen or data is added
function broadcastUpdate(type, data) {
    const message = JSON.stringify({ type, data });
    socket.send(message);
}

// Listen for updates from the server
socket.onmessage = event => {
    const { type, data } = JSON.parse(event.data);
    if (type === 'citizen') {
        citizens.push(data);
        renderCitizens();
    }
    // Handle other types of updates similarly
};








function saveCitizen() {
    const citizen = {
        id: Date.now(),
        name: document.getElementById('name').value,
        birthDate: document.getElementById('births').value,
        // Add other fields
    };

    // Add or update the citizen locally
    citizens.push(citizen);
    renderCitizens();
    saveToLocalStorage();

    // Broadcast the new citizen to other clients
    broadcastUpdate('citizen', citizen);
}













// Existing code...

// WebSocket connection
const socket = new WebSocket('wss://your-websocket-server-url');

// Function to broadcast updates to all connected clients
function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data });
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  }
}

// Listen for updates from the server
socket.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  handleUpdate(type, data);
};

// Handle incoming updates
function handleUpdate(type, data) {
  switch (type) {
    case 'newCitizen':
      citizens.push(data);
      renderCitizens();
      break;
    case 'updateCitizen':
      const index = citizens.findIndex(c => c.id === data.id);
      if (index !== -1) {
        citizens[index] = data;
        renderCitizens();
      }
      break;
    case 'deleteCitizen':
      citizens = citizens.filter(c => c.id !== data.id);
      renderCitizens();
      break;
    // Add more cases for other types of updates as needed
  }
}

// Modify the saveCitizen function to broadcast updates
function saveCitizen() {
  // Existing validation code...

  const citizen = currentCitizenId ? citizens.find(c => c.id === currentCitizenId) : { id: Date.now() };
  if (citizen) {
    // Existing code to update citizen data...

    if (!currentCitizenId) {
      citizens.push(citizen);
      broadcastUpdate('newCitizen', citizen);
    } else {
      broadcastUpdate('updateCitizen', citizen);
    }

    saveToLocalStorage();
    renderCitizens();
    cancelEdit();
  }
}

// Modify the deleteCitizen function to broadcast updates
function deleteCitizen(id) {
  if (!roles[currentUser.role].canDeleteCitizen) {
    alert('You do not have permission to delete citizens.');
    return;
  }

  if (confirm('Are you sure you want to delete this citizen?')) {
    citizens = citizens.filter(c => c.id !== id);
    broadcastUpdate('deleteCitizen', { id });
    saveToLocalStorage();
    renderCitizens();
  }
}

// Existing code...

























const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on port 8080');



