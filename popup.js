import { ACTIONS } from "./actions.js";

const LOCAL_STORAGE_KEY_MAPPING = "footPedalKeyMapping";
const LOCAL_STORAGE_ORDER_LIST = "footPedalOrderList";

let keyMapping = {};
let orderList = [];

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function createMapping() {
  if (isObjectEmpty(keyMapping)) {
    let storedObjectString = localStorage.getItem(LOCAL_STORAGE_KEY_MAPPING);
    let storedOrderList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDER_LIST));
    orderList = storedOrderList !== null ? storedOrderList : [];
    if (storedObjectString !== null ) {
      keyMapping = JSON.parse(storedObjectString);
      console.log(keyMapping);
      for(let i=0;i < orderList.length; i++){
        if (keyMapping.hasOwnProperty(orderList[i])) {
          let outputKeys = keyMapping[orderList[i]];
          if (Array.isArray(outputKeys) && outputKeys.length === 0) continue;
          let mapping = addNewMapping();
          mapping.querySelector(".input-key").value = orderList[i];
          let outputField = mapping.querySelector(".output-key");
          outputField.value = outputKeys[0].key;
          outputField.setAttribute("keycode", outputKeys[0].keycode);
          for(let i=1; i<outputKeys.length; i++){
            let newOutputField = addOutputField(mapping);
            newOutputField.value = outputKeys[i].key;
            newOutputField.setAttribute("keycode", outputKeys[0].keycode);
          }
        }
      }
    }
  }
  updateMapping();
}

function updateMapping() {
  keyMapping = {};
  let mappingDiv = document.getElementById("mapping-space");
  let keyMappingList = mappingDiv.querySelectorAll(".key-mapping");
  orderList = [];
  Array.from(keyMappingList).forEach(function (parentDiv) {
    let inputKey = parentDiv.querySelector(".input-key").value;
    let outputFields = parentDiv.querySelectorAll(".output-key");
    keyMapping[inputKey] = [];
    for(let i =0; i<outputFields.length; i++){
      keyMapping[inputKey].push({key: outputFields[i].value, keycode: outputFields[i].getAttribute("keycode")});
    }
    orderList.push(inputKey);
  });
  localStorage.setItem(LOCAL_STORAGE_ORDER_LIST, JSON.stringify(orderList))
  localStorage.setItem(LOCAL_STORAGE_KEY_MAPPING, JSON.stringify(keyMapping));
  chrome.runtime.sendMessage({
    action: ACTIONS.UPDATE_KEY_MAPPING,
    keyMapping: keyMapping,
  });
  console.log(keyMapping);
}

function deleteMapping(event) {
  let parentDiv = event.target.parentNode;
  parentDiv.remove();
  updateMapping();
}


function addOutputField(parentDiv) {
  let fields = parentDiv.getElementsByClassName("output-key");
  let outputField = createOutputField();
  if (fields.length > 0) {
    let lastOutputField = fields[fields.length - 1];
    parentDiv.insertBefore(outputField, lastOutputField.nextSibling);
  }
  return outputField;
}

function createOutputField(){
  let outputKey = document.createElement("input");
  outputKey.type = "text";
  outputKey.classList.add("output-key");
  outputKey.setAttribute("keycode", "");
  outputKey.onkeydown = function(event) {
    outputKey.value = event.key;
    outputKey.setAttribute("keycode", event.key.match(/^[a-z]$/) ? event.key.charCodeAt(0) : event.keyCode);
    event.preventDefault();
    updateMapping();
};
  return outputKey;
}

function addNewMapping() {
  let mappingDiv = document.getElementById("mapping-space");
  let newMapping = document.createElement("div");
  newMapping.classList.add("key-mapping");

  let inputKeyLabel = document.createElement("label");
  inputKeyLabel.innerHTML = "number:";
  inputKeyLabel.classList.add("input-key-label");
  let inputKey = document.createElement("input");
  inputKey.type = "text";
  inputKey.classList.add("input-key");
  newMapping.appendChild(inputKeyLabel);
  newMapping.appendChild(inputKey);

  let outputKeyLabel = document.createElement("label");
  outputKeyLabel.innerHTML = "char:";
  outputKeyLabel.classList.add("output-key-label");
  let outputKey = createOutputField();
  newMapping.appendChild(outputKeyLabel);
  newMapping.appendChild(outputKey);

  let addFieldButton = document.createElement("button");
  addFieldButton.innerHTML = "+";
  addFieldButton.classList.add("add-field-button");
  newMapping.appendChild(addFieldButton);

  let deleteButton = document.createElement("button");
  deleteButton.innerHTML = "X";
  deleteButton.classList.add("delete-button");
  newMapping.appendChild(deleteButton);

  mappingDiv.appendChild(newMapping);
  inputKey.addEventListener("input", updateMapping);
  addFieldButton.addEventListener("click", (event)=>{addOutputField(event.target.parentNode);});
  deleteButton.addEventListener("click", deleteMapping);
  return newMapping;
}

window.addEventListener("load", () => {
  document
    .getElementById("add-button")
    .addEventListener("click", addNewMapping);
  createMapping();
  updateMapping();
});