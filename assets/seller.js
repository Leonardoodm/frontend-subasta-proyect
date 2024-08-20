import { getSubastaId, getSubastas, updateDeleteSubasta } from "../conexionApi/admin/Subastas.js";

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


document.addEventListener('DOMContentLoaded', async () => {
    // console.log('DOM fully loaded and parsed');
    const status = 'procesando'; // Aquí puedes ajustar el estado que quieres filtrar

   
    function eliminarSubasta(id) {
        const confirmacion = confirm("¿Está seguro que desea eliminar esta subasta?");
        if (confirmacion) {
            const body = {
                estadoPedido: 'canceladoRev',
                postAgain: 1
            };
            updateDeleteSubasta(id, body).then(result => {
                if (result.success) {
                    alert('Subasta eliminada correctamente');
                    location.reload();
                } else {
                    alert('Error eliminando la subasta');
                }
            }).catch(error => {
                console.error('Error updating subasta:', error);
                alert('Error eliminando la subasta');
            });
        }
    }

    try {
        const result = await getSubastas(status);
        console.log('Resultado de getSubastas:', result);
        if (result.success) {
            const subastasContainer = document.getElementById('subastas-rowSeller');
            console.log('Contenedor de subastas:', subastasContainer); // Verificar si se encuentra el contenedor
            if (subastasContainer) {
                const subastas = result.data.subastaVenta; // Accede a subastaVenta dentro de result.data
                console.log('Subastas obtenidas:', subastas);

                if (Array.isArray(subastas)) {
                    subastas.forEach((subasta, index) => {
                        console.log('Procesando subasta:', subasta); // Verificar cada subasta
                        const card = document.createElement('div');
                        card.className = 'col-md-4 mb-4'; // Clase de Bootstrap para 3 columnas por fila
                        const imagen = `/assets/imagenesTenis/${index + 1}.png`; // Seleccionar la imagen según el índice

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
                                    <div class="d-flex justify-content-between">
                                        <a href="#" class="btn btn-primary ver-subasta-btnS" data-id="${subasta.id}">Ver subasta</a>
                                        <a href="#" class="btn btn-danger eliminar-subasta-btn" data-id="${subasta.id}">Eliminar</a>
                                    </div>
                                </div>
                            </div>
                        `;

                        subastasContainer.appendChild(card);
                    });

                    // Añadir manejador de eventos para los botones "Ver subasta"
                    document.querySelectorAll('.ver-subasta-btnS').forEach(button => {
                        button.addEventListener('click', async (event) => {
                            event.preventDefault();
                            const subastaId = event.target.dataset.id;
                            console.log('ID de la subasta:', subastaId);

                            try {
                                const result = await getSubastaId(subastaId);
                                console.log('Resultado de getSubastaId:', result);
                                if (result.success) {
                                    const subasta = result.data.subastaVenta;
                                    const modalBody = document.getElementById('subasta-detailsSeller');

                                    const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';
                                    const tipo = mapTipo(subasta.producto.tipo); // Obtener la descripción del tipo

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

                    // Añadir manejador de eventos para los botones "Eliminar subasta"
                    document.querySelectorAll('.eliminar-subasta-btn').forEach(button => {
                        button.addEventListener('click', (event) => {
                            event.preventDefault();
                            const subastaId = event.target.dataset.id;
                            console.log('ID de la subasta a eliminar:', subastaId);
                            eliminarSubasta(subastaId);
                        });
                    });

                } else {
                    console.error('Expected an array but received:', subastas);
                    subastasContainer.innerHTML = '<p>No se encontraron subastas.</p>';
                }
            } else {
                console.error('El contenedor de subastas no se encontró.');
            }
        } else {
            console.error('Error fetching subastas:', result.message);
        }
    } catch (error) {
        console.error('Error fetching subastas:', error);
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    const status = 'pendienteRev'; // Estado para filtrar las subastas
    console.log('Document loaded, fetching subastas with status:', status);
    try {
        const result = await getSubastas(status);
        console.log('getSubastas result:', result);
        if (result.success) {
            const subastasContainer = document.getElementById('subastas-seller-aceptar-row');
            if (subastasContainer) {
                const subastas = result.data.subastaVenta; // Accede a subastaVenta dentro de result.data

                if (Array.isArray(subastas)) {
                    console.log('Found subastas:', subastas);
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
                                        <strong>Precio Estimado:</strong> ${subasta.precioEstimado} MX<br>
                                        <strong>Precio Puja:</strong> ${subasta.precioPuja} MX<br>
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
                            console.log('ID de la subasta:', subastaId);

                            try {
                                const result = await getSubastaId(subastaId);
                                console.log('getSubastaId result:', result);
                                if (result.success) {
                                    const subasta = result.data.subastaVenta;
                                    const modalBody = document.getElementById('subasta-details-Seller');

                                    const clienteNombre = subasta.cliente ? subasta.cliente.nombre : 'N/A';
                                    const tipo = mapTipo(subasta.producto.tipo); // Obtener la descripción del tipo
                                    modalBody.innerHTML = `
                                        <strong>ID:</strong> ${subasta.id}<br>
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

                                    // Añadir manejador de eventos para los botones "Aceptar" y "Rechazar"
                                    document.getElementById('aceptar-btn').onclick = async () => {
                                        if (confirm('¿Está seguro de que desea aceptar esta subasta?')) {
                                            const updateData = { estadoPedido: 'aceptadoRev' };
                                            const updateResult = await updateDeleteSubasta(subasta.id, updateData);
                                            console.log('updateDeleteSubasta result:', updateResult);
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
                                            const updateData = { estadoPedido: 'canceladoRev' };
                                            const updateResult = await updateDeleteSubasta(subasta.id, updateData);
                                            console.log('updateDeleteSubasta result:', updateResult);
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
                console.error('El contenedor de subastas no se encontró.');
            }
        } else {
            console.error('Error fetching subastas:', result.message);
        }
    } catch (error) {
        console.error('Error fetching subastas:', error);
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    const status = 'canceladoRev'; // Estado para filtrar las subastas canceladas
    try {
        const result = await getSubastas(status);
        if (result.success) {
            const subastasContainer = document.getElementById('subastas-seller-cancelar-row');
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
                                        <strong>Precio Estimado:</strong> ${subasta.precioEstimado} MX<br>
                                        <strong>Precio Puja:</strong> ${subasta.precioPuja} MX<br>
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