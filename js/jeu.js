// nom de la div contenant les div personel de chaque ennemis
var ennemis = "ennemis";
// reference a la classe des laser / missiles tiré
var gMissile = "missile";
// reference a la classe des vaisseau ennemis
var vaisseau = "vaisseau";
// div de notre vaiseau
var cowboy = "cowboy";
// div contenante
var container = "container";
// etat de display des monstres mort et des laser/missile apres utilisation
var none = "none";
var gameOver = 0;
var win = 0;
// variable de gestion de la limite a un tir
var fire = false;
// position fixe du vaiseau en hauteur
var shipPositionY = parseInt(getComputedStyle(document.getElementById(cowboy), null).top);
// largeur et hauteur du container.
var containerHeight = document.getElementsByTagName("body")[0].getBoundingClientRect().height;
var containerWidth = parseInt(getComputedStyle(document.getElementById(container), null).width);
// monheight recuperation de la hauteur de base des ennemies modifié par la suite
var monHeight = document.getElementById(ennemis).getBoundingClientRect().height;
// sauvegarde de la valeur de monheight
var heightSave = monHeight;
// valeur de margin de depard des monstres
var monMargin = 25;
// variable de gestion du sens (direction droite ou gauche de deplacement des extraterrestre)
var dir = 0;
// variable gestion de la pause
var pause = false;
// gestion du score
var score = 0;
// gestion de la hauteur supplementaire par ligne ennemie detruite
var mod = 4;
/*var sonPerdu = createSon("perdu.wav");
var sonGagne = createSon("gagné.wav");
var sonLaser = createSon("Laser.wav");*/


//creation du tir et instantiation des valeurs de base
function createSon(chemin)
{
	var player = new Audio();
	player.src = chemin;
	player.play();
}

function fireFrei() {
	if (!pause) {
		var newFire = document.createElement("div");

		createSon("Laser.wav");
		newFire.setAttribute("class", gMissile);
		document.body.appendChild(newFire, document.getElementById(cowboy));
	}
}

//fonction permettant de cacher les tirs de laser a supprimer par la suite
function removeShot(index) {
	var missile = document.getElementsByClassName(gMissile)[index];
	var container = missile.offsetParent;

	missile.style.display = none;
}

//fonction permettant la gestion des deplacement des tirs de lasers
function missileLaunch(missileY, index, i) {
	if (!pause) {
		var tmp = document.getElementsByClassName(gMissile);

		missileY = missileY - 2;
		if (findHitted(checkHitbox(ennemis, index)) == true) {
			return fire = false;
		} else if (tmp != null && tmp[index])
			tmp[index].style.top = missileY + 'px';
		else {
			removeShot(missile, index);
			return (false);
		}
		if (i < 300) {
			i++;
			if (document.getElementsByClassName(gMissile)[index])
				setTimeout(function () {
					missileLaunch(missileY, index, i);
				}, 10);
			return fire = true;
		} else {
			removeShot(index);
			return fire = false;
		}
	} else {
		setTimeout(function () {
			missileLaunch(missileY, index, i)
		}, 50);
	}
}

//check si un laser ou un missile hit la div contenant nos ennemis afin de pouvoir identifier l'ennemie hit
function checkHitbox(index) {
	var missile = document.getElementsByClassName(gMissile)[index];
	if (!missile)
		return (null);
	var sizeArray = [missile.getBoundingClientRect(),
					 document.getElementById(ennemis).getBoundingClientRect(),
					 document.getElementsByClassName(vaisseau)];
	var missileY = sizeArray[0].top;
	var missileX = sizeArray[0].left;

	if (missileY < sizeArray[1].top + sizeArray[1].height &&
		missileY > sizeArray[1].top &&
		missileX < sizeArray[1].left + sizeArray[1].width &&
		missileX > sizeArray[1].left) {
		return (sizeArray);
	} else if (missileY + sizeArray[0].height < sizeArray[1].top + sizeArray[1].height &&
		missileY + sizeArray[0].height > sizeArray[1].top &&
		missileX + sizeArray[0].width < sizeArray[1].left + sizeArray[1].width &&
		missileX + sizeArray[0].width > sizeArray[1].left) {
		return (sizeArray);
	}
	return (null);
}

//identifier l'ennemie hit, une foie identifier on arrete de l'afficher
function findHitted(dataArray) {
	if (dataArray == null) {
		return (false);
	}

	var topPosition = dataArray[0].top;
	var leftPosition = dataArray[0].left;
	var spaceShip = dataArray[2];
	var size;
	var i = 0;

	while (dataArray[2][i] != null) {
		spaceShip = dataArray[2][i];
		size = spaceShip.getBoundingClientRect();
		if (size.top < topPosition && topPosition < size.top + size.height &&
			size.left < leftPosition && leftPosition < size.left + size.width &&
			spaceShip.childNodes[0].style.display != none) {
			spaceShip.childNodes[0].style.display = none;
			score += 50;
			createSon("explosion.wav");
			document.getElementById('score').innerHTML = "Score : " + score;
			return (true);
		}
		i++;
	}
	return (false);
}

//fonction de deplacement du tir
function shotFired() {
	var index = 0;
	while (document.getElementsByClassName(gMissile)[index]) {
		var ret = null;
		ret = checkHitbox(index);
		if (ret != null) {
			if (findHitted(ret) == true)
				removeShot(index);
			ret = null;
		}
		index = index + 1;
	}
	setTimeout(function () {
		shotFired()
	}, 10);
}

//fonction de deplacement de la div contenant le groupe d'ennemie
// dir correspond au sens (0 => a droite 1 => a gauche)
// monMargin correspond au marginLeft du groupe d'ennemie
// monHeight correspond au marginTop du groupe d'ennemie
function moveHeight() {
	var monsters;

	if (monMargin < 40 && monMargin > 0) {
		monMargin = (dir == 0) ? monMargin + 1 : monMargin - 1;
	} else if (monMargin == 40 || monMargin == 0) {
		monMargin = (dir == 1) ? monMargin + 1 : monMargin - 1;
		dir = (dir + 1) % 2;
		monHeight += containerHeight / 15;
	}
	monsters = document.getElementById(ennemis);
	monsters.style.marginTop = ((monHeight / containerHeight) * 25) + "%";
	monsters.style.marginLeft = monMargin + "%";
}

// fonction qui permet de calculer le nombre de ligne a ne pas prendre en compte dans la hauteur de fin de game
function calcHight() {
	var spaceShip = document.getElementsByClassName(vaisseau);
	var ret;
	var tmp;
	var j = 0;
	var i = 0;

	while (spaceShip[i]) {
		i++;
	}
	i--;
	tmp = spaceShip[i].childNodes[0];
	while (i >= 0 && tmp != null && getComputedStyle(tmp, null).display == "none") {
		i--;
		tmp = (i >= 0) ? spaceShip[i].childNodes[0] : null;
		j++;
	}
	ret = Math.trunc((j) / 10);
	return (ret)
}

// fonction récursive (qui se rapelle elle même)
// monMargin correspond au marginLeft du groupe d'ennemie
// monHeight correspond au marginTop du groupe d'ennemie
function moveMonsters() {
	var restart;
	var nb = 0;

	if (!pause && gameOver == 0 && win == 0) {
		moveHeight();
		nb = (calcHight() * mod);
		if (nb == 3 * mod) {
			document.getElementById('win').style.display = "block";
			document.getElementById('win2').innerHTML += "Vous avez marquer " + score + " points";
			document.getElementById('container').style.display = "none";
			createSon("gagné.wav");
			win = 1;
		} else if ((monHeight / containerHeight) * 25 < 23 + nb) {
			setTimeout(moveMonsters, 200);
		} else {
			document.getElementById('gameover').style.display = "block";
			document.getElementById('gameover2').innerHTML += "Vous avez marquer " + score + " points";
			document.getElementById('container').style.display = "none";
			document.getElementById('score').innerHTML = "Score : " + score;
			createSon("perdu.wav");
			gameOver = 1;
		}
	} else if (gameOver == 0 && win == 0) {
		setTimeout(function () {
			moveMonsters()
		}, 45);
	}
}

function pauseFunction(index) {

	if (!pause && gameOver == 0 && win == 0) {
		while (document.getElementsByClassName(gMissile)[index]) {
			document.getElementsByClassName(gMissile)[index].style.display = "none";
			index++;
		}

		document.getElementById('pause').style.display = "block";
		document.getElementById('container').style.display = "none";
		pause = true;
	} else if (gameOver == 0 && win == 0) {
		document.getElementById('pause').style.display = "none";
		document.getElementById('container').style.display = "block";
		while (document.getElementsByClassName(gMissile)[index]) {
			document.getElementsByClassName(gMissile)[index].style.display = "block";
			index++;
		}
		pause = false;
	}
}

window.onkeydown = function (e) {
	// postion du ship en X
	var shipPositionX = parseInt(getComputedStyle(document.getElementById(cowboy), null).marginLeft);

	// position du missile en Y
	var missileY = shipPositionY - 10;

	var index = 0;
	var i = 0;

	// calcule la position par rapport de la marginLeft
	var position = (shipPositionX / containerWidth) * 100;

	var key = e.keyCode || e.which;

	switch (key) {
	case 37:
		//-Move left
		if (position >= 5) {
			document.getElementById(cowboy).style.marginLeft = (position - 5) + '%';
		}
		break;
	case 39:
		//-Move right
		if (position < 87) {
			document.getElementById(cowboy).style.marginLeft = (position + 5) + '%';
		}
		break;
	case 32:
		// Fire
		if (gameOver == 0 && win == 0) {
			fireFrei();

			if (!pause) {
				while (document.getElementsByClassName(gMissile)[index]) {
					index++;
				}
				index--;

				document.getElementsByClassName(gMissile)[index].style.display = "block";
				document.getElementsByClassName(gMissile)[index].style.marginLeft = (position + 3) + '%';

				while (document.getElementsByClassName(gMissile)[index] != null) {
					missileLaunch(missileY, index, i);
					index++;
				}
			}
		}
		break;
	case 27:
		pauseFunction(index);
		break;
	default:
		break;
	}
};

moveMonsters();
shotFired();
var monElementAudio = document.getElementById('audio');
monElementAudio.volume = 0.5;