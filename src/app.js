(function(){
  const form = document.getElementById('demo-form');
  const resultEl = document.getElementById('result');
  const input = document.getElementById('q');

  if (!form || !resultEl || !input) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const q = input.value.trim();
    if(!q){
      resultEl.textContent = 'Please enter something to continue.';
      resultEl.hidden = false;
      return;
    }
    //I should replace with real processing logic later
    resultEl.textContent = `You entered: ${q}`;
    resultEl.hidden = false;
  });
})();