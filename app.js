document.querySelectorAll('.nav button').forEach(button => {
  button.addEventListener('click', () => {
    showPage(button.dataset.page);
  });
});

function showPage(page) {
  document.querySelectorAll('.page').forEach(el => {
    el.classList.remove('active');
  });

  const target = document.getElementById('page-' + page) || document.getElementById('page-home');
  target.classList.add('active');

  document.querySelectorAll('.nav button').forEach(button => {
    button.classList.toggle('active', button.dataset.page === page);
  });
}
