const ul = document.querySelector('ul');
const loadButton = document.querySelector('.loadData');
const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.prev');
const url = 'https://jsonplaceholder.typicode.com/posts';
let fetched = false;
const controllers = [];
const chunk = 10;
const timers = [];
let currentPage = 0;
const loader = document.querySelector('.content');
const timeOuts = [];
let loaderState = false;
let storage = [];

nextButton.setAttribute('disabled', true);
prevButton.setAttribute('disabled', true);

function delay(time = 500) {
    return new Promise((resolve) => {
        timers.push(setTimeout(resolve, time));
    });
  }

const addPost = (obj, curr) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    h3.innerText = `<h3>${obj.title}</h3>`;
    li.appendChild(h3);
    if (!obj.titleImg) {
        const input = document.createElement("input");
        input.type = 'file';
        input.setAttribute('placeholder', 'Enter your url');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/jpeg, image/png, image/jpg');
        input.classList.add('titleImg');
        input.addEventListener('change', (e) => {
            const id = obj.id - 1;
            storage[id].titleImg = URL.createObjectURL(input.files[0]);
            clearUl();
            addPosts(curr);
        });
        li.appendChild(input);
    } else {
        const img = document.createElement('img');
        img.src = obj.titleImg;
        li.appendChild(img);
    }
    ul.appendChild(li);
}
const clearUl = () => {
    ul.innerHTML = '';
}

const addPosts = (curr) => {
    if (curr != 0 && (!curr || !isFinite(curr))) {
        return;
    }
    if (curr >= 0 && curr <= storage.length - chunk) {
        for (let i = curr; i < curr + chunk; i++){
            addPost(storage[i], curr);
        }
    }
}

const dataFetch = async () => {
    try {
        clearUl();
        const controller = new AbortController();
        controllers.push(controller);
        const response = await fetch(url, {signal : controller.signal })
        await delay(2000);
        storage = await response.json();
        storage.titleImg = null;
        fetched = true;
        loaderState = false;
        loader.style.display = 'none';
        addPosts(currentPage);
        nextButton.removeAttribute('disabled');
    } catch (error) {
        console.log(error);
    }

};

const stopFetching = () => {
    controllers.forEach(el => {
        el.abort();
    });
    timers.forEach(el => {
        clearTimeout(el);
    });
}

loadButton.addEventListener('click', (e) => {
    e.preventDefault();
    stopFetching();
    loaderState = true;
    loader.style.display = 'flex';
    dataFetch();
});

const action = (n) => {
    if (fetched) {
        currentPage += (n * chunk);
        if (currentPage >= storage.length - chunk) {
            currentPage = storage.length - chunk;
            nextButton.setAttribute('disabled', true);
        } else {
            nextButton.removeAttribute('disabled');
        }
        if (currentPage <= 0) {
            currentPage = 0;
            prevButton.setAttribute('disabled', true);
        } else {
            prevButton.removeAttribute('disabled');
        }
        clearUl();
        addPosts(currentPage);
    }
}

nextButton.addEventListener('click', (e) => {
    e.preventDefault();
    action(1);
});

prevButton.addEventListener('click', (e) => {
    e.preventDefault();
    action(-1);
});


