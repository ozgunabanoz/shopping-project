const deleteProduct = async btn => {
  const prodId = btn.parentNode.querySelector('[name=productId]')
    .value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  const prodElem = btn.closest('article');

  try {
    await fetch('/admin/product/' + prodId, {
      method: 'DELETE',
      headers: { 'csrf-token': csrf }
    });

    prodElem.remove();
  } catch (err) {
    console.log(err);
  }
};
