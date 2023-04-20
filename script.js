// Function to animate the navigation bar on scroll
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
	if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
		document.getElementById("navbar").style.padding = "10px 10px";
		document.getElementById("logo").style.fontSize = "25px";
	} else {
		document.getElementById("navbar").style.padding = "30px 10px";
		document.getElementById("logo").style.fontSize = "35px";
	}
}

// Function to animate the gallery images on hover
const images = document.querySelectorAll('.gallery img');

images.forEach(image => {
	image.addEventListener('mouseover', () => {
		image.style.transform = 'scale(1.1)';
	});

	image.addEventListener('mouseout', () => {
		image.style.transform = 'scale(1)';
	});
});

// Function to animate the contact form on submit
const form = document.querySelector('form');

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const name = document.getElementById('name').value;
	const email = document.getElementById('email').value;
	const message = document.getElementById('message').value;

	if (name === '' || email === '' || message === '') {
		alert('Please fill out all fields!');
	} else {
		alert('Thank you for your message!');
		form.reset();
	}
});
