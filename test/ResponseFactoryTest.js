import '@angular/compiler';
import { HttpHeaders } from '@angular/common/http';
import { ResponseFactory } from '../lib/impl/response-factory-impl';
import { @dataProvider } from '@jymfony/decorators';
import { expect } from 'chai';

const BadResponse = Solido.Atlante.Requester.Response.BadResponse;
const BadResponsePropertyTree = Solido.Atlante.Requester.Response.BadResponsePropertyTree;
const InvalidResponse = Solido.Atlante.Requester.Response.InvalidResponse;
const Response = Solido.Atlante.Requester.Response.Response;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class ResponseFactoryTest extends TestCase {
    get testCaseName() {
        return '[Angular] ResponseFactory';
    }

    @dataProvider('provideParseCases')
    testFromResponse(requesterResponse, responseClass, statusCode, expectedData) {
        const factory = new ResponseFactory();
        const response = factory.fromResponse(requesterResponse);

        expect(response).to.be.instanceof(responseClass);
        expect(response.getStatusCode()).to.be.equal(statusCode);
        expect(response.getData()).to.be.deep.equal(expectedData);
    }

    * provideParseCases() {
        const mock = (statusCode, content, headers) => {
            const isError = statusCode >= 400;

            return {
                status: statusCode,
                body: isError ? undefined : content,
                error: isError ? content : undefined,
                headers: new HttpHeaders(headers),
            }
        };

        let headers = {};
        let statusCode = 200;
        let content = 'foobar';

        yield [ mock(statusCode, content, headers), InvalidResponse, statusCode, content ];

        content = '{"_id":"foo"}';
        yield [ mock(statusCode, content, headers), InvalidResponse, statusCode, content ];

        headers = { 'content-type': 'application/json' };
        yield [ mock(statusCode, content, headers), Response, statusCode, { _id: 'foo' } ];

        statusCode = 201;
        yield [ mock(statusCode, content, headers), Response, statusCode, { _id: 'foo' } ];

        statusCode = 400;
        content = '{"name":"foo","errors":["Required."],"children":[]}';

        yield [
            mock(statusCode, content, headers),
            BadResponse,
            statusCode,
            BadResponsePropertyTree.parse({
                name: 'foo',
                errors: [ 'Required.' ],
                children: [],
            }),
        ];

        statusCode = 500;
        yield [
            mock(statusCode, content, headers),
            InvalidResponse,
            statusCode,
            {
                name: 'foo',
                errors: [ 'Required.' ],
                children: [],
            },
        ];
    }
}
