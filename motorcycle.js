const bikePhotoDialog = document.querySelector('.bike-photo-dialog');

if (bikePhotoDialog && typeof bikePhotoDialog.showModal === 'function') {
  const enlargedPhoto = bikePhotoDialog.querySelector('img');

  document.querySelectorAll('.bike-gallery a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const photo = link.querySelector('img');
      enlargedPhoto.src = link.href;
      enlargedPhoto.alt = photo.alt;
      bikePhotoDialog.showModal();
    });
  });

  bikePhotoDialog.querySelector('.bike-photo-close').addEventListener('click', () => bikePhotoDialog.close());
  bikePhotoDialog.addEventListener('click', (event) => {
    if (event.target === bikePhotoDialog) bikePhotoDialog.close();
  });
}
