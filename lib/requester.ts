import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { RequesterInterface } from '@solido/atlante-js/lib/Requester/RequesterInterface';
import { ResponseFactoryInterface } from '@solido/atlante-js/lib/Requester/Response/ResponseFactoryInterface';
import { ResponseInterface } from '@solido/atlante-js/lib/Requester/Response/ResponseInterface';

const isError = (event: HttpEvent<string> | HttpErrorResponse): event is HttpErrorResponse => {
    return 'undefined' !== typeof (<HttpErrorResponse>event).error;
};

@Injectable()
export class Requester implements RequesterInterface {
    constructor(
        @Inject(HttpClient) private _http: HttpClient,
        @Inject(ResponseFactoryInterface) private _responseFactory: ResponseFactoryInterface
    ) {
    }

    request<S>(method: string, path: string, headers: any = {}, requestData?: any): Promise<ResponseInterface> {
        if ('function' === typeof requestData) {
            requestData = requestData();
        }

        let contentTypeSet = false;
        for (const key of Object.keys(headers)) {
            if ('content-type' === key.toLowerCase()) {
                contentTypeSet = true;
            }
        }

        if (! contentTypeSet) {
            headers['Content-Type'] = 'application/json';
        }

        const request: HttpRequest<S> = new HttpRequest<S>(method, path, requestData, {
            headers: new HttpHeaders(headers),
            responseType: 'text',
        });

        return new Promise<ResponseInterface>((resolve): void => {
            const resolver: typeof resolve = (value) => {
                subscription.unsubscribe();
                resolve(value);
            }

            const subscription = this._http
                .request(request)
                .subscribe(
                    (event: HttpEvent<string>) => {
                        this.generateResponse(event, resolver)
                    },
                    (event: HttpErrorResponse) => {
                        this.generateResponse(event, resolver)
                    }
                );
        });
    }

    private generateResponse(event: HttpEvent<string> | HttpErrorResponse, resolver: (value?: ResponseInterface | PromiseLike<ResponseInterface>) => void): void {
        if (! isError(event) && event.type !== HttpEventType.Response) {
            return;
        }

        resolver(this._responseFactory.fromResponse(event));
    }
}
