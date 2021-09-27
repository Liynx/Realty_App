var del = document.getElementById('delete')

del.addEventListener('click', function () {

  // note - for this to work for each button you will need to set
  // a property value="id"
  var id = id.value;

  fetch('delete', {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // pass the id to delete
      // e.g.
      'id': id
    })
  })
  .then(res => {
    if (res.ok) return res.json()
  })
  .then(data => {
    console.log(data)
    window.location.reload()
  })
});

