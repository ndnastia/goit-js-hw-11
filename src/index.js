import { Notify } from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const form = document.querySelector('.search-form');
const markup = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more')

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

simpleLightBox = new SimpleLightbox('.gallery a');
form.addEventListener('submit', onSubmit);



function onSubmit(evt) {
    evt.preventDefault();
  const inputValue = evt.currentTarget.elements.searchQuery.value.trim();
  page = 1;
  query = evt.currentTarget.elements.searchQuery.value.trim();
    
    console.log(inputValue);

    
    if (inputValue === '') {
            Notify.warning(
              'Sorry, there are no images matching your search query. Please try again.'
            );
            return;
          }

      searchPicture(query, page, perPage)
        .then(data => {
          if (data.totalHits === 0) {
            Notify.failure(
              'Sorry, there are no images matching your search query. Please try again.'
            );
          } else {
            markup.innerHTML = createMarkup(data.hits);
            simpleLightBox = new SimpleLightbox('.gallery a').refresh();
            loadMore.style.display = 'block';
          }
        })
        .catch(err => {
          console.log(err);
          return;
        })
        .finally(() => {
          form.reset();
        });
  
}

async function searchPicture(query, page, perPage) {
  const KEY = '36050321-b79e46b27631ddd2509fd0134';
  // const params = new URLSearchParams({
  //   key: KEY,
  //   q: inputValue,
  //   image_type: 'photo',
  //   orientation: 'horizontal',
  //   safesearch: 'true',
  //   page: page,
  //   per_page: 40,
  // });
  const response = await axios.get(
    `?key=${KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
  );
  return response.data;
}




loadMore.addEventListener('click', onClick);
function onClick(evt) {
  evt.preventDefault();
  page += 1;
  loadMore.style.display = 'none';

  searchPicture(query, page, perPage)
    .then(data => {
      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page >= totalPages) {
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        loadMore.style.display = 'none';
      } else {
        markup.innerHTML = createMarkup(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        loadMore.style.display = 'block';
      }
    })
    .catch(err => {
      console.log(err);
      return;
    });
}


function createMarkup(arr) {
    return arr
      .map(
        ({
            id,
            webformatURL,
            largeImageURL,
            tags,
            likes,
            views,
            comments,
            downloads,
        }) => `<a class="gallery__link" href="${largeImageURL}">
  <div class="gallery__box" id="${id}">
      <img src="${webformatURL}" alt="${tags}">
      <ul class="gallery__list"> 
        <li class="gallery__item"><br>Likes</br> ${likes}</li>
        <li class="gallery__item"><br>Views</br> ${views}</li>
        <li class="gallery__item"><br>Comments</br> ${comments}</li>
        <li class="gallery__item"><br>Downloads</br> ${downloads}</li>
      </ul>
    </div>
</a>`
      )
      .join('');
}

