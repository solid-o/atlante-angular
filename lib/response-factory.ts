import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import AbstractResponseFactory from '@solido/atlante-js/lib/Requester/Response/AbstractResponseFactory';
import { Injectable } from '@angular/core';
import { ResponseFactory as ResponseFactoryImpl } from './impl/response-factory-impl';
import { ResponseFactoryInterface } from '@solido/atlante-js/lib/Requester/Response/ResponseFactoryInterface';
import { ResponseInterface } from '@solido/atlante-js/lib/Requester/Response/ResponseInterface';

@Injectable()
export class ResponseFactory extends AbstractResponseFactory {
    private _responseFactory: ResponseFactoryInterface;
    constructor() {
        super();
        this._responseFactory = new ResponseFactoryImpl();
    }

    fromResponse(response: HttpResponse<string> | HttpErrorResponse): ResponseInterface {
        return this._responseFactory.fromResponse(response);
    }
}
