document.getElementById('infoForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the form from submitting

  const formData = new FormData(event.target);

  // Get the JWT token from local storage
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    console.error('JWT token not found');
    console.log('Local Storage:', localStorage);
    return;
  }

  // Log the JWT token
  console.log('JWT token:', token);
  
  // Validate the form inputs
  const fname = formData.get('fname');
  const lname = formData.get('lname');
  const bdate = formData.get('bdate');
  const pseudo = formData.get('pseudo');
  const pp = formData.get('pp');

  // Validate the form inputs
  try {
    const response = await fetch('/info', {
      method: 'POST',
      headers: {
      'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      // Redirect to the ok page or perform any other action
      window.location.href = 'ok.html';
    } else {
      const error = await response.json();
      console.error(error.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});