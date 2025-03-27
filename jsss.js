document.addEventListener('DOMContentLoaded', function() {

  const toggleModeButton = document.getElementById('toggle-mode');
  
  if (toggleModeButton) {
      toggleModeButton.addEventListener('click', function() {
          let newMode = localStorage.getItem('selectedMode') === 'group' ? 'solo' : 'group';
          localStorage.setItem('selectedMode', newMode);

          if (newMode === 'group') {
              console.log("Selected mode: group");
          } else {
              console.log("Selected mode: solo");
          }
      });
  } else {
      console.error('Mode toggle button not found!');
  }

  const radioButtons = document.querySelectorAll('input[name="mix"]');
  radioButtons.forEach((button) => {
      button.addEventListener('change', function() {
          localStorage.setItem('selectedMix', this.value);
          console.log("Selected category:", this.value);
      });
  });

  const selectedMix = localStorage.getItem('selectedMix');
  if (selectedMix) {
      const selectedRadioButton = document.querySelector(`input[value="${selectedMix}"]`);
      if (selectedRadioButton) {
          selectedRadioButton.checked = true;
      }
  }


  const startButton = document.getElementById('start-button');
  
  if (startButton) {
      startButton.addEventListener('click', function() {
          const mode = localStorage.getItem('selectedMode');
          const category = localStorage.getItem('selectedMix');

          if (!mode || !category) {
              alert('Խնդրում ենք ընտրել երաժշտական ոճ և կատեգորիա');
          } else {
              if (mode === 'group') {
                  console.log('Redirecting to aliiasp.html');
                  window.location.href = "aliiasp.html"; 
              } else if (mode === 'solo') {
                  console.log('Redirecting to sologame.html');
                  window.location.href = "sologame.html"; 
              }
          }
      });
  } else {
      console.error('Start button not found!');
  }

});
