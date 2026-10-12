// Global array to store fetched users
let usersArray = [];

// DOM Element references
const loadButton = document.getElementById('load-users');
const filterInput = document.getElementById('filter-input');
const statusText = document.getElementById('status');
const usersList = document.getElementById('users-list');

// Function to render user list dynamically
function renderUsers(list) {
  usersList.innerHTML = ''; // Clear existing items

  if (list.length === 0) {
    statusText.textContent = 'No users match your filter.';
    return;
  }

  // Clear no-match status text if matches exist
  if (usersArray.length > 0) {
    statusText.textContent = `Showing \${list.length} user(s).`;
  }

  list.forEach(user => {
    const li = document.createElement('li');
    // Display name, email, city, and company name using textContent for security
    li.textContent = `${user.name} \vert{} Email:${user.email} | City: ${user.address.city} \vert{} Company:${user.company.name}`;
    usersList.appendChild(li);
  });
}

// Async function to load users from the API
async function loadUsers() {
  // Step 2 Requirements: Update status & disable button
  statusText.textContent = 'Loading users...';
  loadButton.disabled = true;
  usersList.innerHTML = '';

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: \${response.status}`);
    }

    const data = await response.json();
    usersArray = data; // Store in global array

    statusText.textContent = 'Users loaded successfully!';
    renderUsers(usersArray);

  } catch (error) {
    statusText.textContent = `Error fetching users: \${error.message}`;
  } finally {
    // Re-enable button regardless of success or failure
    loadButton.disabled = false;
  }
}

// Event Listeners
loadButton.addEventListener('click', loadUsers);

// Filter functionality without issuing new requests
filterInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase().trim();
  
  const filteredUsers = usersArray.filter(user => 
    user.name.toLowerCase().includes(query)
  );

  renderUsers(filteredUsers);
});