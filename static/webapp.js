/*
 * webapp.js
 * Jeff Ondich
 * 6 November 2020
 *
 * A little bit of Javascript for the tiny web app sample for CS257.
 */

window.onload = initialize;

function initialize() {
    var element = document.getElementById('cats_button');
    if (element) {
        element.onclick = onCatsButton;
    }

    var element = document.getElementById('dogs_button');
    if (element) {
        element.onclick = onDogsButton;
    }

    var element = document.getElementById('dot_file_button');
    if (element) {
        element.onclick = onViewGraph;
    }
}

function getAPIBaseURL() {
    var baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    return baseURL;
}

function onViewGraph() {
    var dot_filename = document.getElementById("dot_file_input").value;
    console.log(dot_filename);

    var cycle_text = document.getElementById('cycle_text');

    if (dot_filename.length == 0){
        cycle_text.innerHTML = "<p>give me a non-empty filename in the './examples' directory</p>";
    } else {
        var url = getAPIBaseURL() + '/showTreeFromDot/' + dot_filename;
        fetch(url, {method: 'get'})
        .then((response) => response.json())
        .then(function(return_text){
            
            var cycle_img = document.getElementById('cycle_img');

            if(return_text.length > 0) {
                cycle_text.innerHTML = '<p style="white-space: pre-line"> cycle:\n' + return_text + "</p>";
                console.log(cycle_img.innerHTML.replace("blank.jpg" | "tree-display.png", "cycle.jpg"));
                cycle_img.innerHTML = cycle_img.innerHTML.replace(/blank.jpg|tree-display.png/g, "cycle.jpg");
            } else {
                cycle_text.innerHTML = "<p>dot file read in successful!!!</p>";
                cycle_img.innerHTML = cycle_img.innerHTML.replace(/blank.jpg|cycle.jpg/g, 'tree-display.png');
            }
        })
        .catch(function(error) {
            console.log(error);
        });
    }
}

function onCatsButton() {
    var url = getAPIBaseURL() + '/cats/';

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(cats) {
        var listBody = '';
        for (var k = 0; k < cats.length; k++) {
            var cat = cats[k];
            listBody += '<li>' + cat['name']
                      + ', ' + cat['birth_year']
                      + '-' + cat['death_year']
                      + ', ' + cat['description'];
                      + '</li>\n';
        }

        var animalListElement = document.getElementById('animal_list');
        if (animalListElement) {
            animalListElement.innerHTML = listBody;
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

function onDogsButton() {
    var url = getAPIBaseURL() + '/dogs/';

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(dogs) {
        var listBody = '';
        for (var k = 0; k < dogs.length; k++) {
            var dog = dogs[k];
            listBody += '<li>' + dog['name']
                      + ', ' + dog['birth_year']
                      + '-' + dog['death_year']
                      + ', ' + dog['description'];
                      + '</li>\n';
        }

        var animalListElement = document.getElementById('animal_list');
        if (animalListElement) {
            animalListElement.innerHTML = listBody;
        }
    })

    .catch(function(error) {
        console.log(error);
    });
}

