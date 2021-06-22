import { EMPTY, fromEvent } from 'rxjs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  mergeMap,
  tap,
  catchError,
  filter,
} from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

type SearchResponse = {
  items: any[];
};

const GITHUB_API_URL = 'https://api.github.com';

const searchInput = document.getElementById('search');
const searchResult = document.getElementById('result');

const stream$ = fromEvent(searchInput, 'input').pipe(
  map((e) => (<HTMLInputElement>event.target).value),
  debounceTime(1000),
  distinctUntilChanged(),
  tap(() => (searchResult.innerHTML = '')),
  filter((v) => !!v.trim()),
  switchMap((value) =>
    ajax
      .getJSON(`${GITHUB_API_URL}/search/users?q=${value}`)
      .pipe(catchError((err) => EMPTY))
  ),
  map((response: SearchResponse) => response.items),
  mergeMap((items) => items)
);

stream$.subscribe((user) => {
  const html = `
    <div class="card">
        <div class="card-image">
            <img src="${user.avatar_url}">
            <span class="card-title">${user.login}</span>
        </div>
        <div class="card-action">
            <a href="${user.html_url}" target="_blank">Open Github</a>
        </div>
    </div>
    `;

  searchResult.insertAdjacentHTML('beforeend', html);
});
