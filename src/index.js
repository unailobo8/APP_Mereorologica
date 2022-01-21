import * as bootstrap from "bootstrap";
import L from "leaflet";

// export for others scripts to use
window.$ = $;
window.jQuery = jQuery;
window.EliminarDiv = EliminarDiv;
window.EliminarCard = EliminarCard;
window.AnadirDropFiltro = AnadirDropFiltro;
window.ObtenerLocal = ObtenerLocal;
var sCiudad = new Set();
var contaux = 0;
var Idaux = 0;
$(".drag-zone").css("visibility", "hidden");
$("#drag-zone-title").css("visibility", "hidden");
$(`#drag-zone0`).droppable();
$(`#drag-zone1`).droppable();
$(`#drag-zone2`).droppable();

//Añade mapa y marcadores
let mymap = L.map("map").setView([43.0621, -2.43755], 8);
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(mymap);
const oBalizas = JSON.parse(window.Balizas);
oBalizas.forEach((b) => {
  var marcador = L.marker([b.GpxY, b.GpxX])
    .addTo(mymap)
    .on("click", function () {
      MostrarCiudad(b.Nombre, b.Id);
    });
});

//Enseña un pequeño div con el nombre de la ciudad y con un icon para eliminarlo
function MostrarCiudad(Localizacion, Id) {
  $("#mInicial").remove();
  if (contaux == 0) {
    $("#drag-zone-title").css("visibility", "visible");
  }
  if (contaux < 12) {
    if (!sCiudad.has(Localizacion)) {
      contaux++;
      $("#CityContainer").append(`
      <div class="CityDiv" id="${Id}" value="${Localizacion}" >
      <h3>${Localizacion} <button type="button" class="btn-close" aria-label="Close" id="Btn${Id}" onclick="EliminarDiv('${Id}', '${Localizacion}')"></button></h3>
      </div>
      `);

      //drag y drop de los elementos de la ciudad al check nox
      sCiudad.add(Localizacion);
      $(function () {
        $(`#${Id}`).draggable({
          revert: true,
          revertDuration: 0,
          start: function () {
            $(`.drag-zone`).css("visibility", "visible");
          },
          stop: function () {
            $(`.drag-zone`).css("visibility", "hidden");
          },
        });
        for (i = 0; i < 4; i++) {
          DropCityTag(i);
        }
      });
    }
  } else {
    alert("No se puede añadir mas de 12 localizaciones, porfavor borre alguna");
  }
}

//drag de los elementos del filtro
$("#humedad").draggable({ revert: true });
$("#viento").draggable({ revert: true });
$("#lluvia").draggable({ revert: true });

function AnadirDropFiltro(i) {
  //dropable del card
  $(`#drag-zone-lleno${i}`).droppable({
    drop: function (event, ui) {
      var clase = $(ui.draggable).attr("class");
      console.log(clase);
      if (clase.includes("bi")) {
        var tem = $(ui.draggable);
        var value = tem.attr("id");
        console.log(value);
        if (value.includes("humedad")) {
          $("#cHumedad" + i).css("display", "block");
        }
        if (value.includes("viento")) {
          $("#cViento" + i).css("display", "block");
        }
        if (value.includes("lluvia")) {
          $("#cLluvia" + i).css("display", "block");
        }
      }
    },
  });
}

//Eliminar el div con el nombre de la ciudad
function EliminarDiv(Id, Localizacion) {
  var elem = document.getElementById(Id);
  elem.parentNode.removeChild(elem);
  contaux--;
  sCiudad.delete(Localizacion);
}

//Eliminar una card
function EliminarCard(Id) {
  $(`#card${Id}`).remove();

  $(`#drag-zone-lleno${Id}`)
    .removeClass()
    .addClass("drag-zone")
    .removeAttr("id")
    .attr("id", `drag-zone${Id}`)
    .append("<i class='bi bi-plus-square'></i>")
    .css("border", "4px dashed white")
    .css("visibility", "hidden");

  if (Id <= Idaux) {
    Idaux = Id;
  }
  DropCityTag(Id);
}

//funcion cuando se dropea el tag de ciudad
function DropCityTag(Id) {
  $(`#drag-zone${Id}`).droppable({
    drop: function (event, ui) {
      var clase = $(ui.draggable).attr("class");
      if (clase.includes("CityDiv")) {
        var tem = $(ui.draggable);
        var value = tem.attr("value");
        var gCiudad = {
          Nombre: value,
          posicion: Id,
        };
        localStorage.setItem(`CiudadInfo${Id}`, JSON.stringify(gCiudad));
        CreateCard(Id, value);
      }
    },
  });
}

//funcion que crea las card
function CreateCard(Id, value) {
  console.log(value);
  $("#drag-zone-title").css("visibility", "hidden");
  var card = `
              <div class="card border-dark mb-3" id="card${Id}" style="width: 18rem;">
                <div class="card-body">
                  <h3 class="card-title" style="text-aling: center;">${value}<button type="button" class="btn-close btn-card" onclick="EliminarCard(${Id})" aria-label="Close"></button></h3>
                  <p><b>Tiempo:</b> Despejado</p>
                  <p><b>Temperatura:</b> 15 &deg;C</p>
                  <p id="cHumedad${Id}"><b>Humedad:</b> 20%</p>
                  <p id="cViento${Id}"><b>Velocidad del Viento:</b> 20 Km/H</p>
                  <p id="cLluvia${Id}"><b>Precipitación Acumulada:</b> 3,0 mm</p>
                </div>
              </div>
              `;
  console.log(Id);
  $(`#drag-zone${Id}`)
    .empty()
    .append(card)
    .css("border", "none")
    .show()
    .removeClass()
    .addClass("drag-zone-lleno")
    .removeAttr("id")
    .attr("id", `drag-zone-lleno${Id}`)
    .droppable("destroy")
    .attr("value", `${Id}`)
    .css("visibility", "visible");

  Vaux = $(`#drag-zone-lleno${Id}`).attr("value");
  AnadirDropFiltro(Vaux);
}

//funcion que crea cartas de informacion usando la informacion de local storage
function ObtenerLocal() {
  var oLocal0 = JSON.parse(localStorage.getItem("CiudadInfo0"));
  var oLocal1 = JSON.parse(localStorage.getItem("CiudadInfo1"));
  var oLocal2 = JSON.parse(localStorage.getItem("CiudadInfo2"));

  if (oLocal0 != null) {
    CreateCard(oLocal0.posicion, oLocal0.Nombre);
  }
  if (oLocal1 != null) {
    CreateCard(oLocal1.posicion, oLocal1.Nombre);
  }
  if (oLocal1 != null) {
    CreateCard(oLocal2.posicion, oLocal2.Nombre);
  }
}
