import { HttpInterceptorFn } from '@angular/common/http';
import { loaderService } from './loader.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(loaderService);
  const skipForHeader = req.headers.has('X-Skip-Loader');

  const skipUrls = ['/cricScore','/v1/current.json'];

  const skipForUrls = skipUrls.some(url => req.url.includes(url));


  if(!(skipForHeader || skipForUrls)){
    loader.show();
  }


    return next(req).pipe(
    finalize(() => {
      if (!(skipForHeader || skipForUrls)) {
        loader.hide();
      }
    })
  );
};
