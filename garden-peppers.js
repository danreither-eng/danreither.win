document.getElementById('printPepperChart').addEventListener('click', () => {
  document.body.classList.add('print-pepper-chart');
  window.print();
});
window.addEventListener('afterprint', () => document.body.classList.remove('print-pepper-chart'));
