document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  
  // Navigation Tabs
  const tabSearchBtn = document.getElementById('tab-search-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const tabManageBtn = document.getElementById('tab-manage-btn');
  const searchSection = document.getElementById('search-section');
  const registerSection = document.getElementById('register-section');
  const manageSection = document.getElementById('manage-section');

  // Search Elements
  const searchForm = document.getElementById('search-form');
  const searchResetBtn = document.getElementById('search-reset-btn');
  const donorsGrid = document.getElementById('donors-grid');
  const resultsCount = document.getElementById('results-count');

  // Registration Elements
  const registrationForm = document.getElementById('registration-form');
  const regName = document.getElementById('reg-name');
  const regPhone = document.getElementById('reg-phone');
  const regBloodGroup = document.getElementById('reg-blood-group');
  const regStatus = document.getElementById('reg-status');
  const regDivision = document.getElementById('reg-division');
  const regDistrict = document.getElementById('reg-district');
  const regUpazila = document.getElementById('reg-upazila');

  // Profile Management Elements
  const manageDonorId = document.getElementById('manage-donor-id');
  const manageFetchBtn = document.getElementById('manage-fetch-btn');
  const editProfileCard = document.getElementById('edit-profile-card');
  const editForm = document.getElementById('edit-form');
  const editDbId = document.getElementById('edit-db-id');
  const editName = document.getElementById('edit-name');
  const editPhone = document.getElementById('edit-phone');
  const editBloodGroup = document.getElementById('edit-blood-group');
  const editStatus = document.getElementById('edit-status');
  const editDivision = document.getElementById('edit-division');
  const editDistrict = document.getElementById('edit-district');
  const editUpazila = document.getElementById('edit-upazila');
  const editCancelBtn = document.getElementById('edit-cancel-btn');
  const editDeleteBtn = document.getElementById('edit-delete-btn');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // --- Regex Rules ---
  // Bangladeshi phone format: 01xxxxxxxxx or +8801xxxxxxxxx or 8801xxxxxxxxx (11-14 chars)
  const phoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

  // --- State Variables ---
  let activeTab = 'search';

  // --- Helper: Toast Notification ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    
    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove toast
    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s reverse';
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 4000);
  }

  // --- Helper: Tab Switcher ---
  function switchTab(tabName) {
    activeTab = tabName;
    
    // Remove active class from buttons & sections
    [tabSearchBtn, tabRegisterBtn, tabManageBtn].forEach(btn => btn.classList.remove('active'));
    [searchSection, registerSection, manageSection].forEach(section => section.classList.remove('active'));
    
    // Add active class to corresponding tab
    if (tabName === 'search') {
      tabSearchBtn.classList.add('active');
      searchSection.classList.add('active');
      fetchDonors(); // Fetch latest list on switch
    } else if (tabName === 'register') {
      tabRegisterBtn.classList.add('active');
      registerSection.classList.add('active');
    } else if (tabName === 'manage') {
      tabManageBtn.classList.add('active');
      manageSection.classList.add('active');
    }
  }

  // Bind tab events
  tabSearchBtn.addEventListener('click', () => switchTab('search'));
  tabRegisterBtn.addEventListener('click', () => switchTab('register'));
  tabManageBtn.addEventListener('click', () => switchTab('manage'));

  // --- Input Validation Helpers ---
  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }

  function displayError(id, msg) {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  // --- API: Load and Search Donors ---
  async function fetchDonors() {
    donorsGrid.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Loading donors...</p>
      </div>
    `;

    // Construct URL with query parameters
    const bg = document.getElementById('search-blood-group').value;
    const div = document.getElementById('search-division').value;
    const dist = document.getElementById('search-district').value;
    const upazila = document.getElementById('search-upazila').value;

    const params = new URLSearchParams();
    if (bg) params.append('bloodGroup', bg);
    if (div) params.append('division', div);
    if (dist) params.append('district', dist);
    if (upazila) params.append('upazilaOrArea', upazila);

    try {
      const response = await fetch(`/api/donors?${params.toString()}`);
      const result = await response.json();

      if (response.ok && result.success) {
        renderDonors(result.data);
      } else {
        showToast(result.error || 'Failed to fetch donors', 'error');
        donorsGrid.innerHTML = `
          <div class="no-results">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p>Error: ${result.error || 'Server returned an error'}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error(error);
      showToast('Network error while loading donors', 'error');
      donorsGrid.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-circle-exclamation"></i>
          <p>Unable to connect to the server database.</p>
        </div>
      `;
    }
  }

  function renderDonors(donors) {
    resultsCount.textContent = `${donors.length} ${donors.length === 1 ? 'Donor' : 'Donors'} Found`;
    
    if (donors.length === 0) {
      donorsGrid.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-users"></i>
          <p>No matching donors found in the database.</p>
        </div>
      `;
      return;
    }

    donorsGrid.innerHTML = donors.map(donor => `
      <div class="donor-card">
        <div class="donor-card-header">
          <div class="donor-blood-badge">${escapeHTML(donor.bloodGroup)}</div>
          <span class="donor-status-badge ${donor.status.toLowerCase()}">${escapeHTML(donor.status)}</span>
        </div>
        <div class="donor-info-main">
          <h4>${escapeHTML(donor.name)}</h4>
          <span class="donor-id-label">Donor ID: ${escapeHTML(donor.donorId)}</span>
        </div>
        <div class="donor-details">
          <span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(donor.upazilaOrArea)}, ${escapeHTML(donor.district)}, ${escapeHTML(donor.division)}</span>
          <span><i class="fa-solid fa-calendar-days"></i> Registered: ${new Date(donor.createdAt).toLocaleDateString()}</span>
        </div>
        <a href="tel:${escapeHTML(donor.phone)}" class="donor-phone-btn">
          <i class="fa-solid fa-phone"></i> ${escapeHTML(donor.phone)}
        </a>
      </div>
    `).join('');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Search event listeners
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    fetchDonors();
  });

  searchResetBtn.addEventListener('click', () => {
    searchForm.reset();
    fetchDonors();
  });

  // --- API: Donor Registration ---
  registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    // Client-side Validation
    let hasError = false;
    
    const nameVal = regName.value.trim();
    const phoneVal = regPhone.value.trim();
    const bgVal = regBloodGroup.value;
    const statusVal = regStatus.value;
    const divVal = regDivision.value;
    const distVal = regDistrict.value.trim();
    const upazilaVal = regUpazila.value.trim();

    if (nameVal.length < 2) {
      displayError('err-reg-name', 'Name must be at least 2 characters long.');
      hasError = true;
    }

    if (!phoneRegex.test(phoneVal)) {
      displayError('err-reg-phone', 'Please enter a valid Bangladeshi phone number.');
      hasError = true;
    }

    if (!bgVal) {
      displayError('err-reg-blood-group', 'Please select a blood group.');
      hasError = true;
    }

    if (!divVal) {
      displayError('err-reg-division', 'Please select a division.');
      hasError = true;
    }

    if (!distVal) {
      displayError('err-reg-district', 'District field is required.');
      hasError = true;
    }

    if (!upazilaVal) {
      displayError('err-reg-upazila', 'Upazila/Area field is required.');
      hasError = true;
    }

    if (hasError) {
      showToast('Validation failed. Please correct inputs.', 'error');
      return;
    }

    const payload = {
      name: nameVal,
      phone: phoneVal,
      bloodGroup: bgVal,
      status: statusVal,
      division: divVal,
      district: distVal,
      upazilaOrArea: upazilaVal
    };

    try {
      const response = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.status === 201 && result.success) {
        const registered = result.data;
        showToast(`Registered successfully! ID: ${registered.donorId}`, 'success');
        
        // Show success modal or alert containing Donor ID
        alert(`Thank you for registering! Your Unique Donor ID is: ${registered.donorId}\nSave this ID to update or delete your profile in the 'Manage Profile' tab.`);
        
        registrationForm.reset();
        switchTab('search');
      } else {
        const errors = result.errors || [result.error || 'Server error occurred'];
        errors.forEach((err, idx) => {
          showToast(err, 'error');
        });
      }
    } catch (error) {
      console.error(error);
      showToast('Network error during registration.', 'error');
    }
  });

  // --- API: Fetch profile for management ---
  async function fetchProfileForEdit() {
    const idVal = manageDonorId.value.trim();
    if (!idVal) {
      showToast('Please enter a Donor ID', 'info');
      return;
    }

    editProfileCard.classList.add('hidden');

    try {
      const response = await fetch(`/api/donors/${idVal}`);
      const result = await response.json();

      if (response.ok && result.success) {
        const donor = result.data;
        // Populate inputs
        editDbId.value = donor.donorId; // We can query by donorId
        editName.value = donor.name;
        editPhone.value = donor.phone;
        editBloodGroup.value = donor.bloodGroup;
        editStatus.value = donor.status;
        editDivision.value = donor.division;
        editDistrict.value = donor.district;
        editUpazila.value = donor.upazilaOrArea;

        editProfileCard.classList.remove('hidden');
        showToast('Profile loaded successfully.', 'success');
        
        // Smooth scroll to edit card
        editProfileCard.scrollIntoView({ behavior: 'smooth' });
      } else {
        showToast(result.error || 'Donor profile not found.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Network error while searching profile.', 'error');
    }
  }

  manageFetchBtn.addEventListener('click', fetchProfileForEdit);
  manageDonorId.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchProfileForEdit();
  });

  // --- API: Update profile ---
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const donorId = editDbId.value;
    const nameVal = editName.value.trim();
    const phoneVal = editPhone.value.trim();
    const bgVal = editBloodGroup.value;
    const statusVal = editStatus.value;
    const divVal = editDivision.value;
    const distVal = editDistrict.value.trim();
    const upazilaVal = editUpazila.value.trim();

    let hasError = false;
    if (nameVal.length < 2) {
      displayError('err-edit-name', 'Name must be at least 2 characters long.');
      hasError = true;
    }
    if (!phoneRegex.test(phoneVal)) {
      displayError('err-edit-phone', 'Please enter a valid Bangladeshi phone number.');
      hasError = true;
    }

    if (hasError) {
      showToast('Validation failed. Please correct inputs.', 'error');
      return;
    }

    const payload = {
      name: nameVal,
      phone: phoneVal,
      bloodGroup: bgVal,
      status: statusVal,
      division: divVal,
      district: distVal,
      upazilaOrArea: upazilaVal
    };

    try {
      const response = await fetch(`/api/donors/${donorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Profile updated successfully!', 'success');
        editProfileCard.classList.add('hidden');
        manageDonorId.value = '';
        switchTab('search');
      } else {
        const errors = result.errors || [result.error || 'Update failed.'];
        errors.forEach(err => showToast(err, 'error'));
      }
    } catch (error) {
      console.error(error);
      showToast('Network error while updating profile.', 'error');
    }
  });

  // Cancel edit
  editCancelBtn.addEventListener('click', () => {
    editProfileCard.classList.add('hidden');
    manageDonorId.value = '';
    showToast('Edit cancelled.', 'info');
  });

  // --- API: Delete profile ---
  editDeleteBtn.addEventListener('click', async () => {
    const donorId = editDbId.value;
    
    const confirmDelete = confirm(`Are you sure you want to permanently delete your donor profile (Donor ID: ${donorId})? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/donors/${donorId}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Profile deleted successfully.', 'success');
        editProfileCard.classList.add('hidden');
        manageDonorId.value = '';
        switchTab('search');
      } else {
        showToast(result.error || 'Failed to delete profile.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Network error during deletion.', 'error');
    }
  });

  // Fetch initial donor list
  fetchDonors();
});
