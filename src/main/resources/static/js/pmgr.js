"use strict"

import * as Pmgr from './pmgrapi.js'

let user = "g2"
let password = "eSMDK"


/**
 * Librería de cliente para interaccionar con el servidor de PeliManager (pmgr).
 * Prácticas de IU 2021-22
 *
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas.
 *
 * Recomiendo separar el fichero en 2 partes:
 * - parte "página-independiente": funciones que pueden generar cachos de
 *   contenido a partir del modelo, pero que no tienen referencias directas a la página
 * - parte pequeña, al final, de "pegamento": asocia comportamientos a
 *   elementos de la página.
 * Esto tiene la ventaja de que, si cambias tu página, sólo deberías tener
 * que cambiar el pegamento.
 *
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él:
 * lo que quieras siempre y cuando
 * - no digas que eres el autor original.
 * - no me eches la culpa de haberlo escrito mal.
 *
 * @Author manuel.freire@fdi.ucm.es
 */

//
// PARTE 1:
// Código de comportamiento, que sólo se llama desde consola (para probarlo) o desde la parte 2,
// en respuesta a algún evento.
//

/**
 * 
 * @param {string} sel CSS usado para indicar qué fieldset quieres convertir
 * en estrellitas. Se espera que el fieldset tenga este aspecto:
 *      <label title="Atómico - 5 estrellas">
            <input type="radio" name="rating" value="5" />
        </label>

        <label title="Muy buena - 4 estrellas">
            <input type="radio" name="rating" value="4" />
        </label>

        <label title="Pasable - 3 estrellas">
            <input type="radio" name="rating" value="3" />
        </label>

        <label title="Más bien mala - 2 estrellas">
            <input type="radio" name="rating" value="2" />
        </label>

        <label title="Horrible - 1 estrella">
            <input type="radio" name="rating" value="1" />
        </label>
 */
function stars(sel) {
    const changeClassOnEvents = (ss, s) => {
        s.addEventListener("change", e => {
            // find current index
            const idx = e.target.value;
            // set selected for previous & self, remove for next
            ss.querySelectorAll("label").forEach(label => {
                if (label.children[0].value <= idx) {
                    label.classList.add("selected");
                } else {
                    label.classList.remove("selected");
                }
            });
        });
    };
    const activateStars = (ss) => {
        ss.classList.add("rating");
        ss.querySelectorAll("input").forEach(s =>
            changeClassOnEvents(ss, s));
        let parent = ss;
        while (!parent.matches("form")) {
            parent = parent.parentNode;
        }
        parent.addEventListener("reset", () => {
            ss.querySelectorAll("input").forEach(e => e.checked = false);
            ss.querySelectorAll("label").forEach(e => e.classList.remove("selected"));
        });
    }
    document.querySelectorAll(sel).forEach(activateStars);
}

function createMovieItem(movie) {
    const r2s = r => r > 0 ? Pmgr.Util.fill(r, () => "⭐").join("") : "";
    const ratings = movie.ratings.map(id => Pmgr.resolve(id)).map(r =>
        `<span class="badge bg-${r.user == userId ? "primary" : "secondary"}">
        ${Pmgr.resolve(r.user).username}: ${r.labels} ${r2s(r.rating)}
        </span>
        `
    ).join("");

    return `
    <div class="col-sm-3 d-flex align-items-stretch">
    <div class="card mx-4 my-3" data-id="${movie.id}">

    <div class="card-header"">
        <h4 class="mb-0" title="${movie.id}">
            ${movie.name} <small><i>(${movie.year})</i></small>
        </h4>
    </div>

    <div>
        <div class="card-body pcard">
            <div class="row">
                <div class="col-auto">
                    <img class="iuthumb" src="${serverUrl}poster/${movie.imdb}"/>
                </div>
                <div class="col">
                    <div class="row-12">
                        ${movie.director} / ${movie.actors} (${movie.minutes} min.)
                    </div>        
                    <div class="row-12">
                        ${ratings}
                    </div>        
                    <div class="iucontrol movie">
                        <button class="rm" data-id="${movie.id}">🗑️</button>
                        <button class="edit" data-id="${movie.id}">✏️</button>
                        <button class="rate" data-id="${movie.id}">⭐</button>
                    </div>  
                </div>
            </div>
        </div>
    </div>
    </div>
    </div>
 `;
}

function createGroupItem(group) {
    let allMembers = group.members.map((id) =>
        `<span class="badge bg-secondary">${Pmgr.resolve(id).username}</span>`
    ).join(" ");
    const waitingForGroup = r => r.status.toLowerCase() == Pmgr.RequestStatus.AWAITING_GROUP;
    let allPending = group.requests.map((id) => Pmgr.resolve(id)).map(r =>
        `<span class="badge bg-${waitingForGroup(r) ? "warning" : "info"}"
            title="Esperando aceptación de ${waitingForGroup(r) ? "grupo" : "usuario"}">
            ${Pmgr.resolve(r.user).username}</span>`

    ).join(" ");

    return `
    <div class="col-sm-3 ">
    <div class="card mx-4 my-3" data-id="${group.id}">
    <div class="card-body pcard">
    <div class="card-header">
        <h4 class="mb-0" title="${group.id}">
            ${group.name} 
            <br>
            <span class="badge badge-pill bg-success"><small>${group.members.length} 🙍</small></span>
        </h4>
    </div>
    <div class="card-body pcard">
        <h7 class="mb-0">Administrador: </h7>
        <span class="badge bg-primary">${Pmgr.resolve(group.owner).username}</span>
        <details>
            <summary>Detalles</summary>
            <div class="row-sm-11">
            <h7 class="mb-0"">Usuarios: </h7>
            <br>
            ${allMembers}
            <br>
            <h7 class="mb-0"">Solicitudes de Unión: </h7>
            <br>
            ${allPending}
        </div>
        </details>
        <br>
        <div class="card-subtitle iucontrol group">
            <button class="rm" data-id="${group.id}">🗑️</button>
            <button class="edit" data-id="${group.id}">✏️</button>
        </div>
    </div>              
    </div>
    </div>
`;

}


//user.groups
//user.id
//user.ratings : []
//user.requests : []
//user.role
//user.username
function createUserItem(user) {
    // let allGroups = user.groups.map((id) =>
    //     `<span class="badge bg-secondary">${Pmgr.resolve(id).name}</span>`
    // ).join(" ");
    // const waitingForGroup = r => r.status.toLowerCase() == Pmgr.RequestStatus.AWAITING_GROUP;
    // let allPending = user.requests.map((id) => Pmgr.resolve(id)).map(r =>
    //     `<span class="badge bg-${waitingForGroup(r) ? "warning" : "info"}"
    //         title="Esperando aceptación de ${waitingForGroup(r) ? "grupo" : "usuario"}">
    //         ${Pmgr.resolve(r.group).name}</span>`
    // ).join(" ");

    let role = "User";
    let color = "";
    let button = "btn-primary"
    if (user.role.split(",").includes("ADMIN")) {
        role = "Admin";
        color = "bg-success text-light";
        button = "btn-warning"
    }
    if (user.role.split(",").includes("ROOT")) {
        role = "Root";
        color = "bg-danger";
        button = "btn-dark";
    }

    return `<li title="${user.id}" data-role="${role}" class="list-group-item d-flex justify-content-between align-items-start ${color}">
                <div class="ms-2 me-auto">
                <div class="fw-bold">${user.username}</div>
                        ${role}
                </div>
                <button type="button" class="btn ${button}" data-id="${user.id}">View</button>
            </li>
            `;

    //<button class="rm" data-id="${user.id}">🗑️</button>
}

/**
 * Usa valores de un formulario para añadir una película
 * @param {Element} formulario para con los valores a subir
 */
function nuevaPelicula(formulario) {
    const movie = new Pmgr.Movie(-1,
        formulario.querySelector('input[name="imdb"]').value,
        formulario.querySelector('input[name="name"]').value,
        formulario.querySelector('input[name="director"]').value,
        formulario.querySelector('input[name="actors"]').value,
        formulario.querySelector('input[name="year"]').value,
        formulario.querySelector('input[name="minutes"]').value);
    Pmgr.addMovie(movie).then(() => {
        formulario.reset() // limpia el formulario si todo OK
        update();
    });
}

/**
 * Usa valores de un formulario para modificar una película
 * @param {Element} formulario para con los valores a subir
 */
function modificaPelicula(formulario) {
    const movie = new Pmgr.Movie(
        formulario.querySelector('input[name="id"]').value,
        formulario.querySelector('input[name="imdb"]').value,
        formulario.querySelector('input[name="name"]').value,
        formulario.querySelector('input[name="director"]').value,
        formulario.querySelector('input[name="actors"]').value,
        formulario.querySelector('input[name="year"]').value,
        formulario.querySelector('input[name="minutes"]').value)
    Pmgr.setMovie(movie).then(() => {
        formulario.reset() // limpia el formulario si todo OK
        modalEditMovie.hide(); // oculta el formulario
        update();
    }).catch(e => console.log(e));
}

/**
 * Usa valores de un formulario para añadir un rating
 * @param {Element} formulario para con los valores a subir
 */
function nuevoRating(formulario) {
    const rating = new Pmgr.Rating(-1,
        formulario.querySelector('input[name="user"]').value,
        formulario.querySelector('input[name="movie"]').value,
        formulario.querySelector('input[name="rating"]:checked').value,
        formulario.querySelector('input[name="labels"]').value);
    Pmgr.addRating(rating).then(() => {
        formulario.reset() // limpia el formulario si todo OK
        modalRateMovie.hide(); // oculta el formulario
        update();
    }).catch(e => console.log(e));
}

/**
 * Usa valores de un formulario para modificar un rating
 * @param {Element} formulario para con los valores a subir
 */
function modificaRating(formulario) {
    const rating = new Pmgr.Rating(
        formulario.querySelector('input[name="id"]').value,
        formulario.querySelector('input[name="user"]').value,
        formulario.querySelector('input[name="movie"]').value,
        formulario.querySelector('input[name="rating"]:checked').value,
        formulario.querySelector('input[name="labels"]').value);
    Pmgr.setRating(rating).then(() => {
        formulario.reset() // limpia el formulario si todo OK
        modalRateMovie.hide(); // oculta el formulario
        update();
    }).catch(e => console.log(e));
}

/**
 * Usa valores de un formulario para añadir una película
 * @param {Element} formulario para con los valores a subir
 */
function generaPelicula(formulario) {
    const movie = Pmgr.Util.randomMovie();
    for (let [k, v] of Object.entries(movie)) {
        const input = formulario.querySelector(`input[name="${k}"]`);
        if (input) input.value = v;
    }
}

/**
 * En un div que contenga un campo de texto de búsqueda
 * y un select, rellena el select con el resultado de la
 * funcion actualizaElementos (que debe generar options), y hace que
 * cualquier búsqueda filtre los options visibles.
 */
let oldHandler = false;
/**
 * Comportamiento de filtrado dinámico para un select-con-busqueda.
 * 
 * Cada vez que se modifica la búsqueda, se refresca el select para mostrar sólo 
 * aquellos elementos que contienen lo que está escrito en la búsqueda
 * 
 * @param {string} div selector que devuelve el div sobre el que operar
 * @param {Function} actualiza el contenido del select correspondiente
 */
function activaBusquedaDropdown(div, actualiza) {
    let search = document.querySelector(`${div} input[type=search]`);
    let select = document.querySelector(`${div} select`);

    // vacia el select, lo llena con elementos validos
    actualiza(`${div} select`);

    // manejador
    const handler = () => {
        let w = search.value.trim().toLowerCase();
        let items = document.querySelectorAll(`${div} select>option`);

        // filtrado; poner o.style.display = '' muestra, = 'none' oculta
        items.forEach(o =>
            o.style.display = (o.innerText.toLowerCase().indexOf(w) > -1) ? '' : 'none');

        // muestra un array JS con los seleccionados
        console.log("Seleccionados:", select.value);
    };

    // filtrado dinámico
    if (oldHandler) {
        search.removeEventListener('input', handler);
    }
    oldHandler = search.addEventListener('input', handler);
}

const hide_all = () => {
    document.querySelectorAll(".filmy_view").forEach(div => {
        div.classList.add("d-none");
    });
}


//
// Función que refresca toda la interfaz. Debería llamarse tras cada operación
// por ejemplo, Pmgr.addGroup({"name": "nuevoGrupo"}).then(update); // <--
//
function update() {

    const appendTo = (sel, html) =>
        document.querySelector(sel).insertAdjacentHTML("beforeend", html);

    const empty = (sel) => {
        const destino = document.querySelector(sel);
        while (destino.firstChild) {
            destino.removeChild(destino.firstChild);
        }
    }

    const create_user_site = () => {

        const users_on_page = 12;
        let pages = "";

        for (let i = 0; i < Pmgr.state.users.length / users_on_page; ++i) {
            pages += `<li class="page-item user_page_btn user_num_button"><a id="user_pag_${i}" class="page-link" href="#">${i + 1}</a></li>`;
        }

        document.querySelector("#user_prev_pag").parentElement.insertAdjacentHTML("afterend", pages);

        document.querySelector("#user_pag").children[1].classList.add("disabled");

        document.querySelectorAll(".user_page_btn").forEach(button => {
            button.addEventListener("click", e => {

                let pagenums = Array.from(document.querySelectorAll(".user_num_button"));

                let last_user_page = pagenums[pagenums.length - 1].firstChild.id.slice(-1);
                let current_user_page = pagenums.find(e => e.classList.contains("disabled")).firstChild.id.slice(-1);

                switch (e.target.id) {
                    case 'user_prev_pag':
                        if (current_user_page != 0) {

                            if (current_user_page == last_user_page)
                                document.querySelector("#user_next_pag").parentElement.classList.remove("disabled");

                            pagenums.find(e => e.classList.contains("disabled")).classList.remove("disabled");
                            let prev_pg = +current_user_page - 1;
                            document.querySelector("#user_pag_" + prev_pg).parentElement.classList.add("disabled");

                            if (prev_pg == 0)
                                e.target.parentElement.classList.add("disabled");

                            console.log(+current_user_page - 1);
                            generate_user_list(+current_user_page - 1);
                        }
                        break;
                    case 'user_next_pag':
                        if (current_user_page != last_user_page) {

                            if (current_user_page == 0)
                                document.querySelector("#user_prev_pag").parentElement.classList.remove("disabled");

                            pagenums.find(e => e.classList.contains("disabled")).classList.remove("disabled");
                            let next_pg = +current_user_page + 1;
                            document.querySelector("#user_pag_" + next_pg).parentElement.classList.add("disabled");

                            if (next_pg == last_user_page)
                                e.target.parentElement.classList.add("disabled");

                            generate_user_list(+current_user_page + 1);
                        }
                        break;
                    default:
                        break;
                }
            });
        });

    }

    const generate_user_list = (num_page = 0) => {

        const users_on_page = 12;

        let users = Pmgr.state.users;

        let min = 0 + (num_page * users_on_page);
        let max = users_on_page + (num_page * users_on_page);

        console.log(users.length);

        if ((users.length / users_on_page) < num_page) {
            min = 0;
            max = users_on_page;
        }

        console.log({ min }, { max });
        empty('#user_list');
        users.slice(min, max).forEach(o => appendTo('#user_list', createUserItem(o)));

    }

    try {


        document.querySelectorAll(".nav_input").forEach(button => {
            button.addEventListener('click', e => {
                console.log(e.target.dataset.id);

                hide_all();
                switch (e.target.dataset.id) {
                    case "groups":
                        document.querySelector("#group_view").classList.remove("d-none");
                        break;
                    case "help":
                        document.querySelector("#help_view").classList.remove("d-none");
                        break;
                    case "users":
                        document.querySelector("#user_view").classList.remove("d-none");
                        break;
                    case "search":
                        document.querySelector("#search_view").classList.remove("d-none");
                        break;
                    case "profile":
                        document.querySelector("#profile_view").classList.remove("d-none");
                        break;
                    case "home":
                    default:
                        document.querySelector("#home_view").classList.remove("d-none");
                        break;
                }
            });
        });

        // PROFILE
        /*document.querySelector("#profile_button").addEventListener("click", e => {
            appendTo("#test_profile", "hello world");
        });*/

        let actualUser = Pmgr.state.users.find(e => e.username == user)


        appendTo('#title_profile', `MY PROFILE`)

        appendTo('#id_profile',
            `<div class="row g-2">
        <div class="col-md">
          <div class="form-floating">
            <input type="word" class="form-control" disabled id="floatingInputGrid" placeholder="Id" value="${actualUser.id}">
            <label for="floatingInputGrid">Id</label>
          </div>
        </div>`)

        appendTo('#user_profile',
            `<div class="row g-2">
        <div class="col-md">
          <div class="form-floating">
            <input type="user" class="form-control" disabled id="floatingInputGrid" placeholder="User Name" value="${user}">
            <label for="floatingInputGrid">User Name</label>
          </div>
        </div>`)

        appendTo('#password_profile',
            `<div class="row g-2">
        <div class="col-md">
          <div class="form-floating">
            <input type="word" class="form-control" disabled id="floatingInputGrid" placeholder="Password" value="${password}">
            <label for="floatingInputGrid">Password</label>
          </div>
        </div>`)

        appendTo('#role_profile',
            `<div class="row g-2">
        <div class="col-md">
          <div class="form-floating">
            <input type="word" class="form-control" disabled id="floatingInputGrid" placeholder="Role" value="${actualUser.role.split(",")[0]}">
            <label for="floatingInputGrid">Role</label>
          </div>
        </div>`)

        appendTo('#groups_profile',
            `<div class="row g-2">
        <div class="col-md">
          <div class="form-floating">
            <input type="word" class="form-control" disabled id="floatingInputGrid" placeholder="Groups" value="${actualUser.groups}">
            <label for="floatingInputGrid">Groups</label>
          </div>
        </div>`)

        console.log(actualUser)

        Pmgr.state.movies.forEach(o => appendTo('#home_row', createMovieItem(o)));

        Pmgr.state.groups.forEach(o => appendTo('#group_row', createGroupItem(o)));

        create_user_site();

        //Search 


        // // vaciamos los contenedores
        // empty("#movies");
        // empty("#groups");
        // empty("#users");

        // // y los volvemos a rellenar con su nuevo contenido
        // Pmgr.state.movies.forEach(o => appendTo("#movies", createMovieItem(o)));
        // Pmgr.state.groups.forEach(o => appendTo("#groups", createGroupItem(o)));
        // Pmgr.state.users.forEach(o => appendTo("#users", createUserItem(o)));

        // // y añadimos manejadores para los eventos de los elementos recién creados
        // // botones de borrar películas
        // document.querySelectorAll(".iucontrol.movie button.rm").forEach(b =>
        //     b.addEventListener('click', e => {
        //         const id = e.target.dataset.id; // lee el valor del atributo data-id del boton
        //         Pmgr.rmMovie(id).then(update);
        //     }));
        // // botones de editar películas
        // document.querySelectorAll(".iucontrol.movie button.edit").forEach(b =>
        //     b.addEventListener('click', e => {
        //         const id = e.target.dataset.id; // lee el valor del atributo data-id del boton
        //         const movie = Pmgr.resolve(id);
        //         const formulario = document.querySelector("#movieEditForm");
        //         for (let [k, v] of Object.entries(movie)) {
        //             // rellenamos el formulario con los valores actuales
        //             const input = formulario.querySelector(`input[name="${k}"]`);
        //             if (input) input.value = v;
        //         }

        //         modalEditMovie.show(); // ya podemos mostrar el formulario
        //     }));
        // // botones de evaluar películas
        // document.querySelectorAll(".iucontrol.movie button.rate").forEach(b =>
        //     b.addEventListener('click', e => {
        //         const id = e.target.dataset.id; // lee el valor del atributo data-id del boton
        //         const formulario = document.querySelector("#movieRateForm");
        //         const prev = Pmgr.state.ratings.find(r => r.movie == id && r.user == userId);
        //         if (prev) {
        //             // viejo: copia valores
        //             formulario.querySelector("input[name=id]").value = prev.id;
        //             const input = formulario.querySelector(`input[value="${prev.rating}"]`);
        //             if (input) {
        //                 input.checked;
        //             }
        //             // lanza un envento para que se pinten las estrellitas correctas
        //             // see https://stackoverflow.com/a/2856602/15472
        //             if ("createEvent" in document) {
        //                 const evt = document.createEvent("HTMLEvents");
        //                 evt.initEvent("change", false, true);
        //                 input.dispatchEvent(evt);
        //             } else {
        //                 input.fireEvent("onchange");
        //             }
        //             formulario.querySelector("input[name=labels]").value = prev.labels;
        //         } else {
        //             // nuevo
        //             formulario.reset();
        //             formulario.querySelector("input[name=id]").value = -1;
        //         }
        //         formulario.querySelector("input[name=movie]").value = id;
        //         formulario.querySelector("input[name=user]").value = userId;
        //         modalRateMovie.show(); // ya podemos mostrar el formulario
        //     }));
        // botones de borrar grupos
        document.querySelectorAll(".iucontrol.group button.rm").forEach(b =>
            b.addEventListener('click', e => Pmgr.rmGroup(e.target.dataset.id).then(update)));
        // // botones de borrar usuarios
        // document.querySelectorAll(".iucontrol.user button.rm").forEach(b =>
        //     b.addEventListener('click', e => Pmgr.rmUser(e.target.dataset.id).then(update)));


    } catch (e) {
        console.log('Error actualizando', e);
    }

    /* para que siempre muestre los últimos elementos disponibles */
    activaBusquedaDropdown('#dropdownBuscablePelis',
        (select) => {
            empty(select);
            Pmgr.state.movies.forEach(m =>
                appendTo(select, `<option value="${m.id}">${m.name}</option>`));
        }
    );
}

//
// PARTE 2:
// Código de pegamento, ejecutado sólo una vez que la interfaz esté cargada.
//

// modales, para poder abrirlos y cerrarlos desde código JS
//const modalEditMovie = new bootstrap.Modal(document.querySelector('#movieEdit'));
//const modalRateMovie = new bootstrap.Modal(document.querySelector('#movieRate'));

// si lanzas un servidor en local, usa http://localhost:8080/
const serverUrl = "http://gin.fdi.ucm.es/iu/";

Pmgr.connect(serverUrl + "api/");

// guarda el ID que usaste para hacer login en userId
let userId = -1;
const login = (username, password) => {
    Pmgr.login(username, password) // <-- tu nombre de usuario y password aquí
}
// -- IMPORTANTE --
login("g2", "eSMDK"); // <-- tu nombre de usuario y password aquí
//   y puedes re-logearte como alguien distinto desde  la consola
//   llamando a login() con otro usuario y contraseña
{
    /** 
     * Asocia comportamientos al formulario de añadir películas 
     * en un bloque separado para que las constantes y variables no salgan de aquí, 
     * manteniendo limpio el espacio de nombres del fichero
     */
    const f = document.querySelector("#addMovie form");
    // botón de enviar
    // f.querySelector("button[type='submit']").addEventListener('click', (e) => {
    //     if (f.checkValidity()) {
    //         e.preventDefault(); // evita que se haga lo normal cuando no hay errores
    //         nuevaPelicula(f); // añade la pelicula según los campos previamente validados
    //     }
    // });
    // botón de generar datos (sólo para pruebas)
    // f.querySelector("button.generar").addEventListener('click',
    //     (e) => generaPelicula(f)); // aquí no hace falta hacer nada raro con el evento
} {
    /**
     * formulario para modificar películas
     */
    const f = document.querySelector("#movieEditForm");
    // botón de enviar
    // document.querySelector("#movieEdit button.edit").addEventListener('click', e => {
    //     console.log("enviando formulario!");
    //     if (f.checkValidity()) {
    //         modificaPelicula(f); // modifica la pelicula según los campos previamente validados
    //     } else {
    //         e.preventDefault();
    //         f.querySelector("button[type=submit]").click(); // fuerza validacion local
    //     }
    // });
} {
    /**
     * formulario para evaluar películas; usa el mismo modal para añadir y para editar
     */
    const f = document.querySelector("#movieRateForm");
    // botón de enviar
    // document.querySelector("#movieRate button.edit").addEventListener('click', e => {
    //     console.log("enviando formulario!");
    //     if (f.checkValidity()) {
    //         if (f.querySelector("input[name=id]").value == -1) {
    //             nuevoRating(f);
    //         } else {
    //             modificaRating(f); // modifica la evaluación según los campos previamente validados
    //         }
    //     } else {
    //         e.preventDefault();
    //         f.querySelector("button[type=submit]").click(); // fuerza validacion local
    //     }
    // });
    // activa rating con estrellitas
    stars("#movieRateForm .estrellitas");
}

/**
 * búsqueda básica de películas, por título
 */

// document.querySelector("#movieSearch").addEventListener("input", e => {
//     const v = e.target.value.toLowerCase();
//     document.querySelectorAll("#movies div.card").forEach(c => {
//         const m = Pmgr.resolve(c.dataset.id);
//         // aquí podrías aplicar muchos más criterios
//         const ok = m.name.toLowerCase().indexOf(v) >= 0;
//         c.style.display = ok ? '' : 'none';
//     });
// })

// cosas que exponemos para poder usarlas desde la consola
//window.modalEditMovie = modalEditMovie;
//window.modalRateMovie = modalRateMovie;
window.update = update;
window.login = login;
window.userId = userId;
window.Pmgr = Pmgr;

// ejecuta Pmgr.populate() en una consola para generar datos de prueba en servidor
// ojo - hace *muchas* llamadas a la API (mira su cabecera para más detalles)
// Pmgr.populate();