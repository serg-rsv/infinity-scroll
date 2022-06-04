// API service
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '27629620-bf8dbf1d2d77ad53435eb2e20';

let page = 1;
const perPage = 20;

function fetchImages(query) {
  const reqParams = `?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`;

  return fetch(BASE_URL + reqParams)
    .then((date) => date.json())
    .then((parseResp) => {
      page += 1;
      return parseResp.hits;
    });
}

// refs

const refs = {
  input: document.querySelector('input'),
  ul: document.querySelector('#list'),
};

refs.input.addEventListener('input', _.debounce(onInput, 300));

function onInput() {
  const query = refs.input.value.trim();
  if (query === '') {
    refs.ul.innerHTML = '';
    return;
  }

  fetchImages(query).then((imgs) => {
    const markup = imgs
      .map(({ largeImageURL, webformatURL, tags }) => {
        return `
        <li >
          <a class="photo-card" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" data-source="${largeImageURL}" />
          </a>
        </li>`;
      })
      .join('');

    refs.ul.insertAdjacentHTML('beforeend', markup);

    const links = document.querySelectorAll('.photo-card');
    links.forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        basicLightbox
          .create(
            `<img src="${e.target.dataset.source}" width="800" height="600">`
          )
          .show();
      })
    );

    loadMore();
  });
}

// Helper infinity loader

function loadMore() {
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          onInput();
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  observer.observe(document.querySelector('li:last-child'));
}
