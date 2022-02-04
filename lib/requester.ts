import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Requester as RequesterImpl} from './impl/requester-impl';
import { RequesterInterface } from '@solido/atlante-js/lib/Requester/RequesterInterface';
import { ResponseFactoryInterface } from '@solido/atlante-js/lib/Requester/Response/ResponseFactoryInterface';
import { ResponseInterface } from '@solido/atlante-js/lib/Requester/Response/ResponseInterface';

@Injectable()
export class Requester implements RequesterInterface {
    private _requesterImpl: RequesterInterface;

    constructor(
        @Inject(HttpClient) _http: HttpClient,
        @Inject(ResponseFactoryInterface) _responseFactory: ResponseFactoryInterface
    ) {
        this._requesterImpl = new RequesterImpl(_http, _responseFactory)
    }

    request(method: string, path: string, headers: any = {}, requestData?: any): Promise<ResponseInterface> {
        return this._requesterImpl.request(method, path, headers, requestData);
    }
}
