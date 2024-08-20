import { createAuction, getSubastaId, getSubastas, getSubastasAdmAceptar, updateAdmSubasta } from '../conexionApi/admin/Subastas.js';
import { deleteUser, getUsers, updateUser } from '../conexionApi/admin/Usuarios.js';
import { loginUser } from '../conexionApi/auth/login.js';
import { createProduct, getProductById, getProductsSeller, updateProduct } from '../conexionApi/products/Productos.js';

$(document).ready(function () {
    // Cargar elementos comunes
    loadCommonElements();

    // Cargar elementos específicos del administrador
    loadAdminElements();

    // Cargar elementos específicos del seller
    loadSellerElements();
});

function loadCommonElements() {
    $("#navBar").load("../components/cabecera/navBar.html", checkAuthentication);
    $("#footer").load("../components/cabecera/footer.html");
    $("#modal-container").load("../components/Modales/login.html", function () {
        $('#loginButton').on('click', async function (event) {
            event.preventDefault();
            await handleLogin();
        });
    });
}

function loadAdminElements() {
    $("#navBarAdm").load("../../components/cabeceraAdm/navBar.html", checkAuthentication);
    $("#footerAdm").load("../../components/cabeceraAdm/footer.html");
}

function loadSellerElements() {
    $("#navBarSeller").load("../../components/cabeceraSeller/navBar.html", checkAuthentication);
    $("#footerSeller").load("../../components/cabeceraSeller/footer.html");
}

function checkAuthentication() {
    if (localStorage.getItem('isAuthenticated') === 'true') {
        const userRole = localStorage.getItem('rol');
        if (userRole === 'administrador') {
            addAdminMenuItem();
        } else if (userRole === 'revendedor') {
            addSellerMenuItem();
        }
        showLogoutIcon();
    } else {
        showLoginIcon();
    }
}

async function handleLogin() {
    const email = $('#loginEmail').val().trim();
    const password = $('#loginPassword').val().trim();

    let valid = true;
    if (email === '') {
        $('#loginEmail').addClass('is-invalid');
        $('#loginEmailError').text('Email no puede estar vacío').show();
        valid = false;
    } else {
        $('#loginEmail').removeClass('is-invalid');
        $('#loginEmailError').hide();
    }

    if (password === '') {
        $('#loginPassword').addClass('is-invalid');
        $('#loginPasswordError').text('Password no puede estar vacío').show();
        valid = false;
    } else {
        $('#loginPassword').removeClass('is-invalid');
        $('#loginPasswordError').hide();
    }

    if (!valid) return;

    console.log('Email:', email);
    console.log('Password:', password);

    try {
        const result = await loginUser(email, password);
        if (result.success) {
            const userData = result.data;
            // Cerrar el modal
            $('#loginModal').modal('hide');
            // Cambiar el icono de login a logout
            showLogoutIcon();
            // Añadir el item de menú según el rol
            if (userData.usuario.rol === 'administrador') {
                addAdminMenuItem();
            } else if (userData.usuario.rol === 'revendedor') {
                addSellerMenuItem();
            }
            // Redirigir según el rol
            setTimeout(() => {
                if (userData.usuario.rol === 'administrador') {
                    window.location.href = '../pages/admin/admin-dashboard.html';
                } else if (userData.usuario.rol === 'revendedor') {
                    window.location.href = '../pages/seller/seller-dashboard.html';
                }
            }, 500); // Espera de 500 ms para asegurarse de que el modal se haya cerrado
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Login failed:', error);
        showError('Email o Password son incorrectos');
    }
}

function showLogoutIcon() {
    $('#authIcon').html('<i class="fa fa-sign-out-alt" aria-hidden="true"></i>'); // Usa la clase correcta de Font Awesome
    $('#authIcon').off('click').on('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('isAuthenticated');
        $('#navMenu').find('.admin-menu-item, .seller-menu-item').remove(); // Eliminar items de menú específicos de roles
        showLoginIcon();
        window.location.href = '../../index.html'; // Redirigir a index.html
    });
}

function showLoginIcon() {
    $('#authIcon').html('<i class="fa fa-user" aria-hidden="true"></i>');
    $('#authIcon').off('click').on('click', function () {
        $('#loginModal').modal('show');
    });
}

function addAdminMenuItem() {
    $('#navMenu').append(`
        <li class="nav-item admin-menu-item">
            <a class="nav-link" href="../../pages/admin/admin-dashboard.html">Admin</a>
        </li>
    `);
}

function addSellerMenuItem() {
    $('#navMenu').append(`
        <li class="nav-item seller-menu-item">
            <a class="nav-link" href="../../pages/seller/seller-dashboard.html">Seller</a>
        </li>
    `);
}

function showError(message) {
    $('#loginError').text(message).show();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await getUsers();
        if (result.success) {
            if (Array.isArray(result.data)) {
                // Crea la tabla
                const table = document.createElement('table');
                table.className = 'table table-striped'; // Añade clases de Bootstrap para estilo
                table.style.width = '80%'; // Ajusta el ancho de la tabla al 80%
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Rol</th>
                            <th>Opciones</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;
                const tbody = table.querySelector('tbody');

                // Agrega las filas a la tabla
                result.data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.nombre}</td>
                        <td>${user.email}</td>
                        <td class="status-cell">${user.status === 1 ? 'Activo' : 'Inactivo'}</td>
                        <td>${user.rol}</td>
                        <td>
                            <button class="btn btn-warning edit-btn" data-id="${user.id}" data-toggle="modal" data-target="#editModal">Editar</button>
                            <button class="btn btn-danger delete-btn" data-id="${user.id}">Eliminar</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // Verificar si el contenedor de usuarios existe
                const userContainer = document.getElementById('user-container');
                if (userContainer) {
                    userContainer.appendChild(table);
                } else {
                    // console.error('El contenedor de usuarios no se encontró.');
                }

                // Obtener el modal y el botón de cerrar
                const modal = document.getElementById('editModal');
                const closeBtn = document.querySelector('.close');

                // Verificar si el botón de cerrar existe antes de agregar el evento
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        $('#editModal').modal('hide');
                    });
                }

                // Agregar manejadores de eventos para botones (opcional)
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const userId = event.target.dataset.id;
                        const user = result.data.find(u => u.id == userId);

                        // Verificar si el usuario existe antes de rellenar el formulario
                        if (user) {
                            // Rellena el formulario con los datos del usuario
                            const editId = document.getElementById('editId');
                            const editNombre = document.getElementById('editNombre');
                            const editEmail = document.getElementById('editEmail');
                            const editStatus = document.getElementById('editStatus');
                            const editRol = document.getElementById('editRol');

                            if (editId && editNombre && editEmail && editStatus && editRol) {
                                editId.value = user.id;
                                editNombre.value = user.nombre;
                                editEmail.value = user.email;
                                editStatus.value = user.status;
                                editRol.value = user.rol;

                                // Muestra el modal
                                $('#editModal').modal('show');
                            } else {
                                // console.error('Uno o más elementos del formulario no se encontraron.');
                            }
                        }
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const userId = event.target.dataset.id;
                        console.log('Eliminar usuario con ID:', userId);
                        // Lógica para eliminar el usuario
                        const deleteResult = await deleteUser(userId);
                        if (deleteResult.success) {
                            // Actualiza el estado a "Inactivo" en la tabla
                            const statusCell = event.target.closest('tr').querySelector('.status-cell');
                            statusCell.textContent = 'Inactivo';
                        } else {
                            console.error('Error eliminando usuario:', deleteResult.message);
                        }
                    });
                });

                // Agrega el manejador de eventos para el formulario de edición
                const editForm = document.getElementById('editForm');
                if (editForm) {
                    editForm.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        const id = document.getElementById('editId').value;
                        const nombre = document.getElementById('editNombre').value;
                        const email = document.getElementById('editEmail').value;
                        const status = document.getElementById('editStatus').value;
                        const rol = document.getElementById('editRol').value;

                        const updateResult = await updateUser(id, { nombre, email, status, rol });
                        if (updateResult.success) {
                            // Actualiza la tabla con los nuevos datos
                            const row = tbody.querySelector(`button[data-id="${id}"]`).closest('tr');
                            row.querySelector('td:nth-child(2)').textContent = nombre;
                            row.querySelector('td:nth-child(3)').textContent = email;
                            row.querySelector('.status-cell').textContent = status === '1' ? 'Activo' : 'Inactivo';
                            row.querySelector('td:nth-child(5)').textContent = rol;

                            // Cierra el modal
                            $('#editModal').modal('hide');
                        } else {
                            console.error('Error actualizando usuario:', updateResult.message);
                        }
                    });
                }
            } else {
                console.error('Expected an array but received:', result.data);
            }
        } else {
            console.error('Error fetching users:', result.message);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
});




// Función para mapear los tipos
function mapTipo(tipo) {
    switch (tipo) {
        case 'H':
            return 'Hombre';
        case 'M':
            return 'Mujer';
        case 'NH':
            return 'Niño';
        case 'NM':
            return 'Niña';
        default:
            return 'Desconocido';
    }
}
//administrador
document.addEventListener('DOMContentLoaded', async () => {
    const status = 'procesando'; // Aquí puedes ajustar el estado que quieres filtrar
    try {
        const result = await getSubastas(status);
        if (result.success) {
            const subastasContainer = document.getElementById('subastas-row');
            if (subastasContainer) {
                const subastas = result.data.subastaVenta; // Accede a subastaVenta dentro de result.data

                if (Array.isArray(subastas)) {
                    subastas.forEach((subasta, index) => {
                        const card = document.createElement('div');
                        card.className = 'col-md-4 mb-4'; // Clase de Bootstrap para 3 columnas por fila
                        const imagen = `/assets/imagenesTenis/${index + 31}.png`; // Seleccionar la imagen según el índice

                        // Verificar si el cliente existe antes de acceder a sus propiedades
                        const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';

                        card.innerHTML = `
                            <div class="card h-100">
                                <img src="${imagen}" class="card-img-top" alt="${subasta.producto.modelo}">
                                <div class="card-body">
                                    <h5 class="card-title">${subasta.producto.modelo}</h5>
                                    <p class="card-text">
                                        <strong>Revendedor:</strong> ${subasta.revendedor.nombre}<br>
                                        <strong>Estado del Pedido:</strong> ${subasta.estadoPedido}
                                    </p>
                                    <a href="#" class="btn btn-primary ver-subasta-btn" data-id="${subasta.id}">Ver subasta</a>
                                </div>
                            </div>
                        `;

                        subastasContainer.appendChild(card);
                    });

                    // Añadir manejador de eventos para los botones "Ver subasta"
                    document.querySelectorAll('.ver-subasta-btn').forEach(button => {
                        button.addEventListener('click', async (event) => {
                            event.preventDefault();
                            const subastaId = event.target.dataset.id;
                            // console.log('ID de la subasta:', subastaId);

                            try {
                                const result = await getSubastaId(subastaId);
                                if (result.success) {
                                    const subasta = result.data.subastaVenta;
                                    const modalBody = document.getElementById('subasta-details');

                                    const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';
                                    const tipo = mapTipo(subasta.producto.tipo); // Obtener la descripción del tipo
                                    // <strong>ID:</strong> ${subasta.id}<br> esto va a abajo pero es opcional
                                    modalBody.innerHTML = `
                                        <strong>Precio Estimado:</strong> ${subasta.precioEstimado} MX<br>
                                        <strong>Precio Puja:</strong> ${subasta.precioPuja} MX<br>
                                        <strong>Revendedor:</strong> ${subasta.revendedor.nombre}<br>
                                        <strong>Cliente:</strong> ${clienteNombre}<br>
                                        <strong>Producto:</strong> ${subasta.producto.modelo}<br>
                                        <strong>Marca:</strong> ${subasta.producto.marca}<br>
                                        <strong>Talla:</strong> ${subasta.producto.talla}<br>
                                        <strong>Descripción:</strong> ${subasta.producto.descripcion}<br>
                                        <strong>Tipo:</strong> ${tipo}<br>
                                        <strong>Estado del Pedido:</strong> ${subasta.estadoPedido}
                                    `;

                                    // Mostrar el modal
                                    $('.bd-example-modal-lg').modal('show');
                                } else {
                                    console.error('Error fetching subasta details:', result.message);
                                }
                            } catch (error) {
                                console.error('Error fetching subasta details:', error);
                            }
                        });
                    });
                } else {
                    console.error('Expected an array but received:', subastas);
                    subastasContainer.innerHTML = '<p>No se encontraron subastas.</p>';
                }
            } else {
                // console.error('El contenedor de subastas no se encontró.');
            }
        } else {
            console.error('Error fetching subastas:', result.message);
        }
    } catch (error) {
        console.error('Error fetching subastas:', error);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const status = 'enviandoAdm'; // Estado para filtrar las subastas
    try {
        const result = await getSubastasAdmAceptar(status);
        if (result.success) {
            const subastasContainer = document.getElementById('subastas-adm-aceptar-row');
            if (subastasContainer) {
                const subastas = result.data.subastaVenta; // Accede a subastaVenta dentro de result.data

                if (Array.isArray(subastas)) {
                    subastas.forEach((subasta, index) => {
                        const card = document.createElement('div');
                        card.className = 'col-md-4 mb-4'; // Clase de Bootstrap para 3 columnas por fila
                        const imagen = `/assets/imagenesTenis/${index + 11}.png`; // Seleccionar la imagen según el índice

                        // Verificar si el cliente existe antes de acceder a sus propiedades
                        const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';

                        card.innerHTML = `
                            <div class="card h-100">
                                <img src="${imagen}" class="card-img-top" alt="${subasta.producto.modelo}">
                                <div class="card-body">
                                    <h5 class="card-title">${subasta.producto.modelo}</h5>
                                    <p class="card-text">
                                        <strong>Precio Estimado:</strong> ${subasta.precioEstimado} USD<br>
                                        <strong>Precio Puja:</strong> ${subasta.precioPuja} USD<br>
                                        <strong>Revendedor:</strong> ${subasta.revendedor.nombre}<br>
                                        <strong>Cliente:</strong> ${clienteNombre}<br>
                                        <strong>Estado del Pedido:</strong> ${subasta.estadoPedido}
                                    </p>
                                    <a href="#" class="btn btn-primary ver-subasta-btn" data-id="${subasta.id}">Ver subasta</a>
                                </div>
                            </div>
                        `;

                        subastasContainer.appendChild(card);
                    });

                    // Añadir manejador de eventos para los botones "Ver subasta"
                    document.querySelectorAll('.ver-subasta-btn').forEach(button => {
                        button.addEventListener('click', async (event) => {
                            event.preventDefault();
                            const subastaId = event.target.dataset.id;
                            // console.log('ID de la subasta:', subastaId);

                            try {
                                const result = await getSubastaId(subastaId);
                                if (result.success) {
                                    const subasta = result.data.subastaVenta;
                                    const modalBody = document.getElementById('subasta-details');

                                    const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';
                                    const tipo = mapTipo(subasta.producto.tipo); // Obtener la descripción del tipo
                                    modalBody.innerHTML = `
                                        <strong>ID:</strong> ${subasta.id}<br>
                                        <strong>Precio Estimado:</strong> ${subasta.precioEstimado} USD<br>
                                        <strong>Precio Puja:</strong> ${subasta.precioPuja} USD<br>
                                        <strong>Revendedor:</strong> ${subasta.revendedor.nombre}<br>
                                        <strong>Cliente:</strong> ${clienteNombre}<br>
                                        <strong>Producto:</strong> ${subasta.producto.modelo}<br>
                                        <strong>Marca:</strong> ${subasta.producto.marca}<br>
                                        <strong>Talla:</strong> ${subasta.producto.talla}<br>
                                        <strong>Descripción:</strong> ${subasta.producto.descripcion}<br>
                                        <strong>Tipo:</strong> ${tipo}<br>
                                        <strong>Estado del Pedido:</strong> ${subasta.estadoPedido}
                                    `;

                                    // Mostrar el modal
                                    $('.bd-example-modal-lg').modal('show');

                                    // Añadir manejador de eventos para los botones "Aceptar" y "Rechazar"
                                    document.getElementById('aceptar-btn').onclick = async () => {
                                        if (confirm('¿Está seguro de que desea aceptar esta subasta?')) {
                                            const updateResult = await updateAdmSubasta(subasta.id, 'aceptadoAdm');
                                            if (updateResult.success) {
                                                alert('Subasta aceptada exitosamente.');
                                                location.reload(); // Recargar la página para actualizar la lista
                                            } else {
                                                alert('Error al aceptar la subasta: ' + updateResult.message);
                                            }
                                        }
                                    };

                                    document.getElementById('rechazar-btn').onclick = async () => {
                                        if (confirm('¿Está seguro de que desea rechazar esta subasta?')) {
                                            const updateResult = await updateAdmSubasta(subasta.id, 'canceladoAdm');
                                            if (updateResult.success) {
                                                alert('Subasta rechazada exitosamente.');
                                                location.reload(); // Recargar la página para actualizar la lista
                                            } else {
                                                alert('Error al rechazar la subasta: ' + updateResult.message);
                                            }
                                        }
                                    };
                                } else {
                                    console.error('Error fetching subasta details:', result.message);
                                }
                            } catch (error) {
                                console.error('Error fetching subasta details:', error);
                            }
                        });
                    });
                } else {
                    console.error('Expected an array but received:', subastas);
                    subastasContainer.innerHTML = '<p>No se encontraron subastas.</p>';
                }
            } else {
                // console.error('El contenedor de subastas no se encontró.');
            }
        } else {
            console.error('Error fetching subastas:', result.message);
        }
    } catch (error) {
        console.error('Error fetching subastas:', error);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const status = 'canceladoAdm'; // Estado para filtrar las subastas canceladas
    try {
        const result = await getSubastas(status);
        if (result.success) {
            const subastasContainer = document.getElementById('subastas-adm-cancelar-row');
            if (subastasContainer) {
                const subastas = result.data.subastaVenta; // Accede a subastaVenta dentro de result.data

                if (Array.isArray(subastas)) {
                    subastas.forEach((subasta, index) => {
                        const card = document.createElement('div');
                        card.className = 'col-md-4 mb-4'; // Clase de Bootstrap para 3 columnas por fila
                        const imagen = `/assets/imagenesTenis/${index + 21}.png`; // Seleccionar la imagen según el índice

                        // Verificar si el cliente existe antes de acceder a sus propiedades
                        const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';

                        card.innerHTML = `
                            <div class="card h-100">
                                <img src="${imagen}" class="card-img-top" alt="${subasta.producto.modelo}">
                                <div class="card-body">
                                    <h5 class="card-title">${subasta.producto.modelo}</h5>
                                    <p class="card-text">
                                        <strong>Precio Estimado:</strong> ${subasta.precioEstimado} USD<br>
                                        <strong>Precio Puja:</strong> ${subasta.precioPuja} USD<br>
                                        <strong>Revendedor:</strong> ${subasta.revendedor.nombre}<br>
                                        <strong>Cliente:</strong> ${clienteNombre}<br>
                                        <strong>Estado del Pedido:</strong> ${subasta.estadoPedido}
                                    </p>
                                </div>
                            </div>
                        `;

                        subastasContainer.appendChild(card);
                    });
                } else {
                    // console.error('Expected an array but received:', subastas);
                    subastasContainer.innerHTML = '<p>No se encontraron subastas canceladas.</p>';
                }
            } else {
                // console.error('El contenedor de subastas no se encontró.');
            }
        } else {
            console.error('Error fetching subastas:', result.message);
        }
    } catch (error) {
        console.error('Error fetching subastas:', error);
    }
});


//productos
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await getProductsSeller();
        if (result.success) {
            const productosContainer = document.getElementById('productos-container');
            if (productosContainer) {
                const productos = result.data.productosRev;

                if (Array.isArray(productos)) {
                    productos.forEach((producto, index) => {
                        const card = document.createElement('div');
                        card.className = 'col-md-3 mb-4';

                        const imagen = `/assets/imagenesTenis/${index + 31}.png`;
                        const status = producto.status === 1 ? 'Activo' : 'Inactivo';
                        const tipo = mapTipo(producto.tipo);

                        card.innerHTML = `
                            <div class="card h-100">
                                <img src="${imagen}" class="card-img-top" alt="${producto.modelo}">
                                <div class="card-body">
                                    <h5 class="card-title">${producto.modelo}</h5>
                                    <p class="card-text">
                                        <strong>Marca:</strong> ${producto.marca}<br>
                                        <strong>Talla:</strong> ${producto.talla}<br>
                                        <strong>Descripción:</strong> ${producto.descripcion}<br>
                                        <strong>Tipo:</strong> ${tipo}<br>
                                        <strong>Status:</strong> ${status}<br>
                                    </p>
                                    <div class="d-flex justify-content-between">
                                        <button class="btn btn-primary" data-toggle="modal" data-target="#productModal" onclick="viewProduct(${producto.id})">Ver Producto</button>
                                        <button class="btn btn-secondary" data-toggle="modal" data-target="#editProductModal" onclick="editProduct(${producto.id})">Editar</button>
                                    </div>
                                </div>
                            </div>
                        `;

                        productosContainer.appendChild(card);
                    });
                } else {
                    console.error('Expected an array but received:', productos);
                    productosContainer.innerHTML = '<p>No se encontraron productos.</p>';
                }
            } else {
                // console.error('El contenedor de productos no se encontró.');
            }
        } else {
            console.error('Error fetching productos:', result.message);
        }
    } catch (error) {
        console.error('Error fetching productos:', error);
    }
});

window.viewProduct = async (id) => {
    try {
        console.log(`Fetching product details for ID: ${id}`);  // Agrega este log para verificar el ID
        const result = await getProductById(id);
        if (result.success) {
            const producto = result.data;
            const status = producto.status === 1 ? 'Activo' : 'Inactivo';
            const tipo = mapTipo(producto.tipo);

            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h5>${producto.modelo}</h5>
                <p>
                    <strong>Marca:</strong> ${producto.marca}<br>
                    <strong>Talla:</strong> ${producto.talla}<br>
                    <strong>Descripción:</strong> ${producto.descripcion}<br>
                    <strong>Tipo:</strong> ${tipo}<br>
                    <strong>Status:</strong> ${status}<br>
                </p>
                ${producto.status === 1 ? `<button class="btn btn-success" onclick="openCreateAuctionModal(${producto.id})">Crear Subasta</button>` : ''}
            `;

            $('#productModal').modal('show');
        } else {
            console.error('Error fetching product details:', result.message);
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
};

window.editProduct = async (id) => {
    try {
        console.log(`Fetching product details for ID: ${id}`);  // Agrega este log para verificar el ID
        const result = await getProductById(id);
        if (result.success) {
            const producto = result.data;

            document.getElementById('editProductId').value = producto.id;
            document.getElementById('editModelo').value = producto.modelo;
            document.getElementById('editMarca').value = producto.marca;
            document.getElementById('editTalla').value = producto.talla;
            document.getElementById('editDescripcion').value = producto.descripcion;
            document.getElementById('editTipo').value = producto.tipo;
            document.getElementById('editStatus').value = producto.status;

            $('#editProductModal').modal('show');
        } else {
            console.error('Error fetching product details:', result.message);
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
};

document.getElementById('createProductButton').addEventListener('click', () => {
    // console.log('Estoy dando click en Crear Producto');
    $('#createProductModal').modal('show'); // Abrir modal manualmente
});

document.getElementById('editProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('editProductId').value;
    const updatedProduct = {
        modelo: document.getElementById('editModelo').value,
        marca: document.getElementById('editMarca').value,
        talla: document.getElementById('editTalla').value,
        descripcion: document.getElementById('editDescripcion').value,
        tipo: document.getElementById('editTipo').value,
        status: document.getElementById('editStatus').value
    };

    const result = await updateProduct(id, updatedProduct);
    if (result.success) {
        $('#editProductModal').modal('hide');
        location.reload();
    } else {
        console.error('Error updating product:', result.message);
    }
});

document.getElementById('createProductForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const newProduct = {
        modelo: document.getElementById('createModelo').value,
        marca: document.getElementById('createMarca').value,
        descripcion: document.getElementById('createDescripcion').value,
        talla: document.getElementById('createTalla').value,
        tipo: document.getElementById('createTipo').value,
    };

    const result = await createProduct(newProduct);
    if (result.success) {
        console.log('Producto creado exitosamente:', result.data);  // Log para confirmar la creación del producto
        $('#createProductModal').modal('hide');
        location.reload();
    } else {
        console.error('Error creating product:', result.message);
    }
});

window.openCreateAuctionModal = (id) => {
    document.getElementById('auctionProductId').value = id;
    $('#createAuctionModal').modal('show');
};

document.getElementById('createAuctionForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productId = document.getElementById('auctionProductId').value;
    const auctionPrice = document.getElementById('auctionPrice').value;

    const auctionData = {
        precioEstimado: auctionPrice,
        productoID: productId
    };

    console.log('Sending auction data:', auctionData);

    const result = await createAuction(auctionData);
    if (result.success) {
        $('#createAuctionModal').modal('hide');
        location.reload();
    } else {
        console.error('Error creating auction:', result.message);
    }
});

// subastasSeller
// document.addEventListener('DOMContentLoaded', async () => {
//     console.log('DOM fully loaded and parsed');
//     const status = 'procesando'; // Aquí puedes ajustar el estado que quieres filtrar
//     try {
//         const result = await getSubastas(status);
//         console.log('Resultado de getSubastas:', result);
//         if (result.success) {
//             const subastasContainer = document.getElementById('subastas-rowSeller');
//             console.log('Contenedor de subastas:', subastasContainer); // Verificar si se encuentra el contenedor
//             if (subastasContainer) {
//                 const subastas = result.data.subastaVenta; // Accede a subastaVenta dentro de result.data
//                 console.log('Subastas obtenidas:', subastas);

//                 if (Array.isArray(subastas)) {
//                     subastas.forEach((subasta, index) => {
//                         console.log('Procesando subasta:', subasta); // Verificar cada subasta
//                         const card = document.createElement('div');
//                         card.className = 'col-md-4 mb-4'; // Clase de Bootstrap para 3 columnas por fila
//                         const imagen = `/assets/imagenesTenis/${index + 1}.png`; // Seleccionar la imagen según el índice

//                         // Verificar si el cliente existe antes de acceder a sus propiedades
//                         const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';

//                         card.innerHTML = `
//                             <div class="card h-100">
//                                 <img src="${imagen}" class="card-img-top" alt="${subasta.producto.modelo}">
//                                 <div class="card-body">
//                                     <h5 class="card-title">${subasta.producto.modelo}</h5>
//                                     <p class="card-text">
//                                         <strong>Revendedor:</strong> ${subasta.revendedor.nombre}<br>
//                                         <strong>Estado del Pedido:</strong> ${subasta.estadoPedido}
//                                     </p>
//                                     <a href="#" class="btn btn-primary ver-subasta-btnS" data-id="${subasta.id}">Ver subasta</a>
//                                 </div>
//                             </div>
//                         `;

//                         subastasContainer.appendChild(card);
//                     });

//                     // Añadir manejador de eventos para los botones "Ver subasta"
//                     document.querySelectorAll('.ver-subasta-btnS').forEach(button => {
//                         button.addEventListener('click', async (event) => {
//                             event.preventDefault();
//                             const subastaId = event.target.dataset.id;
//                             console.log('ID de la subasta:', subastaId);

//                             try {
//                                 const result = await getSubastaId(subastaId);
//                                 console.log('Resultado de getSubastaId:', result);
//                                 if (result.success) {
//                                     const subasta = result.data.subastaVenta;
//                                     const modalBody = document.getElementById('subasta-detailsSeller');

//                                     const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';
//                                     const tipo = mapTipo(subasta.producto.tipo); // Obtener la descripción del tipo

//                                     modalBody.innerHTML = `
//                                         <strong>Precio Estimado:</strong> ${subasta.precioEstimado} MX<br>
//                                         <strong>Precio Puja:</strong> ${subasta.precioPuja} MX<br>
//                                         <strong>Revendedor:</strong> ${subasta.revendedor.nombre}<br>
//                                         <strong>Cliente:</strong> ${clienteNombre}<br>
//                                         <strong>Producto:</strong> ${subasta.producto.modelo}<br>
//                                         <strong>Marca:</strong> ${subasta.producto.marca}<br>
//                                         <strong>Talla:</strong> ${subasta.producto.talla}<br>
//                                         <strong>Descripción:</strong> ${subasta.producto.descripcion}<br>
//                                         <strong>Tipo:</strong> ${tipo}<br>
//                                         <strong>Estado del Pedido:</strong> ${subasta.estadoPedido}
//                                     `;

//                                     // Mostrar el modal
//                                     $('.bd-example-modal-lg').modal('show');
//                                 } else {
//                                     console.error('Error fetching subasta details:', result.message);
//                                 }
//                             } catch (error) {
//                                 console.error('Error fetching subasta details:', error);
//                             }
//                         });
//                     });
//                 } else {
//                     console.error('Expected an array but received:', subastas);
//                     subastasContainer.innerHTML = '<p>No se encontraron subastas.</p>';
//                 }
//             } else {
//                 console.error('El contenedor de subastas no se encontró.');
//             }
//         } else {
//             console.error('Error fetching subastas:', result.message);
//         }
//     } catch (error) {
//         console.error('Error fetching subastas:', error);
//     }
// });