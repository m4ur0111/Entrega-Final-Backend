// Función para actualizar la URL con los parámetros de consulta
function changePage(page) {
    const sortValue = document.querySelector('.filter-select[name="sort"]').value;
    const queryValue = document.querySelector('.filter-input[name="query"]').value;
    const minPriceValue = document.querySelector('.filter-input[name="minPrice"]').value;
    const maxPriceValue = document.querySelector('.filter-input[name="maxPrice"]').value;
  
    // Almacenar los valores en localStorage
    localStorage.setItem('filterSort', sortValue);
    localStorage.setItem('filterQuery', queryValue);
    localStorage.setItem('filterMinPrice', minPriceValue);
    localStorage.setItem('filterMaxPrice', maxPriceValue);
  
    // Construir la URL con los parámetros de consulta
    const url = `/products?page=${page}&limit=10&sort=${sortValue}&query=${queryValue}&minPrice=${minPriceValue}&maxPrice=${maxPriceValue}`;
    
    // Redireccionar a la URL con los filtros aplicados
    window.location.href = url;
  }
  
  // Manejar el envío del formulario de filtros
  document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    changePage(1); // Cambia a la primera página al aplicar los filtros
  });
  
  // Cargar los valores de los campos de filtro desde localStorage al cargar la página
  window.addEventListener('load', () => {
    document.querySelector('.filter-select[name="sort"]').value = localStorage.getItem('filterSort') || 'asc';
    document.querySelector('.filter-input[name="query"]').value = localStorage.getItem('filterQuery') || '';
    document.querySelector('.filter-input[name="minPrice"]').value = localStorage.getItem('filterMinPrice') || '';
    document.querySelector('.filter-input[name="maxPrice"]').value = localStorage.getItem('filterMaxPrice') || '';
  });
  