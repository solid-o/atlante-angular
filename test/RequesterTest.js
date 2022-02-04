import '@angular/compiler';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Requester } from '../lib/impl/requester-impl';
import { ResponseFactory } from '../lib/impl/response-factory-impl';
import { Subject } from 'rxjs';
import { createRequest } from '@solido/atlante-js/lib/Requester/Request';
import { expect } from 'chai';

const Argument = Jymfony.Component.Testing.Argument.Argument;
const BodyConverterDecorator = Solido.Atlante.Requester.Decorator.BodyConverterDecorator;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

const genericResponse = (headers = {'Content-Type': 'application/json'}, statusCode = 200, statusText = 'OK') => {
    return () => {
        const subject = new Subject();

        (async () => {
            await __jymfony.sleep(1);

            subject.next(new HttpResponse({
                body: '{}',
                headers: new HttpHeaders(headers),
                status: statusCode,
                statusText,
                url: 'resource/subresource',
            }));
        })();

        return subject;
    };
};

export default class RequesterTest extends TestCase {
    __construct() {
        super.__construct();

        /**
         * @type {Jymfony.Component.Testing.Prophecy.ObjectProphecy|HttpClient}
         *
         * @private
         */
        this._httpClient = undefined;

        /**
         * @type {Requester}
         *
         * @private
         */
        this._requester = undefined;
    }

    beforeEach() {
        this._httpClient = this.prophesize(HttpClient);
        this._requester = new Requester(this._httpClient.reveal(), new ResponseFactory());
    }

    async testShouldSetContentTypeHeaderIfNotSet() {
        this._httpClient
            .request(Argument.that(request =>
                'application/json' === request.headers.get('Content-Type')
            ))
            .shouldBeCalled()
            .will(genericResponse());

        await this._requester.request('GET', 'resource/subresource');
    }

    async testShouldNotSetContentTypeHeaderIfSet() {
        this._httpClient
            .request(Argument.that(request =>
                'application/octet-stream' === request.headers.get('Content-Type')
            ))
            .shouldBeCalled()
            .will(genericResponse());

        await this._requester.request('GET', 'resource/subresource', { 'Content-Type': 'application/octet-stream' });
    }

    async testShouldParseResponseHeadersCorrectly() {
        this._httpClient
            .request(Argument.cetera())
            .shouldBeCalled()
            .will(genericResponse({
                'Content-Type': 'application/octet-stream',
                Date: '12 Jan 2019 02:00:00 GMT',
            }));

        const response = await this._requester.request('GET', 'resource/subresource');
        expect(response.getHeaders().get('Content-Type')).to.be.eq('application/octet-stream');
        expect(response.getHeaders().get('Date')).to.be.eq('12 Jan 2019 02:00:00 GMT');
    }

    async testShouldReportStatusCodeCorrectly() {
        this._httpClient
            .request(Argument.cetera())
            .shouldBeCalled()
            .will(genericResponse(undefined, 418, 'I\'m a teapot'));

        const response = await this._requester.request('GET', 'resource/subresource');
        expect(response.getStatusCode()).to.be.eq(418);
    }

    async testShouldWorkWithBodyConverterDecorator() {
        const request = createRequest('POST', 'http://www.example.org', null, { test: 'foo' });
        const decorator = new BodyConverterDecorator();

        const decorated = decorator.decorate(request);
        this._httpClient
            .request(Argument.that(request =>
                '{"test":"foo"}' === request.body
            ))
            .shouldBeCalled()
            .will(genericResponse());

        await this._requester.request(decorated.method, decorated.url, decorated.headers, decorated.body);
    }
}
