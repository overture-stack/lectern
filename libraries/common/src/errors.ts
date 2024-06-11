/*
 * Copyright (c) 2023 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

export class BadRequestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'BadRequest';
	}
}

export class ConflictError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'Conflict';
	}
}

export class ForbiddenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'Forbidden';
	}
}

export class InternalServerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InternalServer';
	}
}

export class InvalidArgument extends Error {
	constructor(argumentName: string) {
		super(`Invalid argument : ${argumentName}`);
	}
}

export class InvalidReferenceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidReference';
	}
}

export class MalformedVersionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MalformedVersion';
	}
}

export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NotFound';
	}
}

export class UnauthorizedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'Unauthorized';
	}
}
