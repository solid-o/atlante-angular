import { NgModule, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Requester } from './requester';
import { RequesterInterface } from '@solido/atlante-js/lib/Requester/RequesterInterface';
import { ResponseFactory } from './response-factory';
import { ResponseFactoryInterface } from '@solido/atlante-js/lib/Requester/Response/ResponseFactoryInterface';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
    ],
    providers: [
        Requester,
        ResponseFactory,
        { provide: RequesterInterface, useExisting: forwardRef(() => Requester) },
        { provide: ResponseFactoryInterface, useExisting: forwardRef(() => ResponseFactory) },
    ],
})
export class AtlanteModule {
}
