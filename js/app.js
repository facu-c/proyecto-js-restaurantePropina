let cliente = {
    mesa: '',
    hora: '',
    pedido: [],
};

let categorias = {
    1:'Comidas',
    2:'Bebidas',
    3:'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const camposVacios = [mesa, hora].some(campos => campos === '' );
    if(camposVacios){
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta){
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);
    
            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        return;
    } else {
        //asignar datos del formulario
        cliente = {...cliente, mesa, hora};
        //console.log(cliente);

        //Ocultar modal

        //obtenemos el formulario
        var modalFormulario = document.querySelector('#formulario');
        //obtenemos la instancia del formulario de bootstrap
        var modalBoostrap = bootstrap.Modal.getInstance(modalFormulario);
        //usamos un metodo para ocultar el modal
        modalBoostrap.hide();

        //mostrar secciones
        mostrarSecciones();

        //obtener platillos de la api de json-server
        obtenerPlatillos();
    };
    

};

function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none') );
};

function obtenerPlatillos(){
    const url = 'http://localhost:4000/platillos';

    fetch(url)
    .then(respuesta => respuesta.json())
    .then(resultado => mostrarPlatillos(resultado))
    .catch(error => console.log(error));
};

function mostrarPlatillos(platillos){
    const contenido = document.querySelector('#platillos .contenido');
    platillos.forEach(platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row','py-3','border-top');

        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3','fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id =`producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        //funcion que detecta la cantidad y el platillo que se esta agregando 
        inputCantidad.onchange = function () {
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo, cantidad});
        };

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    })
};
function agregarPlatillo(producto){

    //generamos una copia del pedido actual para que no se pise
    let {pedido} = cliente;

    //revisar que la cantidad sea mayor a 0
    if(producto.cantidad>0){

        //comprueba si ya existe el elemento
        if(pedido.some(articulo => articulo.id === producto.id)){
            //actualizo la cantidad
            //creo un nuevo arreglo con la cantidad actualizada y no duplicada
            const pedidoActualizado = pedido.map(articulo => {
                //pregunto si es igual
                if(articulo.id === producto.id){
                    //actualizo la cantidad
                    articulo.cantidad = producto.cantidad;
                }
                //devuelvo toda la referencia del objeto
                return articulo;
            });
            //asigno
            cliente.pedido = [...pedidoActualizado];
        } else {
            //el articulo no existe y lo agrego
            cliente.pedido = [...pedido, producto];
        }
    } else {
        //eliminar elementos no deseados
        const resultado = pedido.filter(articulo => articulo.id !== producto.id)
        cliente.pedido = [...resultado];
    }

    //limpiar el contenido del html
    limpiarHTML();

    if(cliente.pedido.length){
        //mostrar resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido');
    
    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6','card','py-5', 'px-3','shadow','text-center');

    //informacion de la mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');
    
    mesa.appendChild(mesaSpan);

    //informacion de la hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    hora.appendChild(horaSpan);

    //Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos consumidos';
    heading.classList.add('my-4','text-center');

    //iterar sobre el array de productos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const {pedido} = cliente;
    pedido.forEach(articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista =document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreElem = document.createElement('H4');
        nombreElem.classList.add('my-4');
        nombreElem.textContent = nombre;

        const cantidadElem = document.createElement('P');
        cantidadElem.classList.add('fw-bold');
        cantidadElem.textContent = `Cantidad: ${cantidad}`;

        const precioElem = document.createElement('P');
        precioElem.classList.add('fw-normal');
        precioElem.textContent = `$${precio}`;

        //subtotal del articulo
        const subtotalElem = document.createElement('P');
        subtotalElem.classList.add('fw-normal');
        subtotalElem.textContent = `Subtotal: $${calcularSubtotal(precio, cantidad)}`;

        //boton para eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn','btn-danger');
        btnEliminar.textContent = 'Eliminar articulo';

        //funcion para que elimine el articulo
        btnEliminar.onclick = function () {
            eliminarProducto(id);
        }

        //agregar elementos a la li
        lista.appendChild(nombreElem);
        lista.appendChild(cantidadElem);
        lista.appendChild(precioElem);
        lista.appendChild(subtotalElem);
        lista.appendChild(btnEliminar);

        //agregar lista al grupo principal
        grupo.appendChild(lista);
    })
    
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo); 

    contenido.appendChild(resumen);

    //mostrar formulario de propinas
    formularioPropinas();
}
function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido');

    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
}
function calcularSubtotal(precio,cantidad){
    return precio*cantidad;
}
function eliminarProducto(id){
    const {pedido} = cliente;
     //eliminar elementos no deseados
    const resultado = pedido.filter(articulo => articulo.id !== id)
    cliente.pedido = [...resultado];

    limpiarHTML();
    if(cliente.pedido.length){
        //mostrar resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    //regresamos al 0 el formulario
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);   
}
function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario =document.createElement('DIV');
    divFormulario.classList.add('card', 'shadow', 'py-5', 'px-3','text-center');

    const heading = document.createElement('H3');
    heading.classList.add('my-4');
    heading.textContent = 'Propina';

    //radio button 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = "10";
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    //radio button 25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = "25";
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    //radio button 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = "50";
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);



    //Agregar al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);
    formulario.appendChild(divFormulario);
    
    //agregar al formulario
    contenido.appendChild(formulario);
}

function calcularPropina(){
    let subtotal = 0;
    const {pedido} = cliente;

    //calcular el subtotal a pagar
    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    })
    //seleccionar la propina
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    //calcular la propina
    const propina = ((subtotal * parseInt(propinaSeleccionada))/100);

    //calcular el total a pagar
    const totalPagar = propina + subtotal;

    mostrarTotalHTML(subtotal,totalPagar,propina);
}

function mostrarTotalHTML(subtotal,totalPagar,propina){

    //div total
    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-3','fw-bold','mt-2');
    subtotalParrafo.textContent = 'Subtotal consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent =`$${subtotal}` ;

    subtotalParrafo.appendChild(subtotalSpan);

    //propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-3','fw-bold','mt-2');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent =`$${propina}` ;

    propinaParrafo.appendChild(propinaSpan);

    //total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-3','fw-bold','mt-2');
    totalParrafo.textContent = 'Subtotal consumo: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent =`$${totalPagar}` ;

    totalParrafo.appendChild(totalSpan);

    //limpiar anotaciones viejas
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv){
        totalPagar.remove();
    }

    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);
}