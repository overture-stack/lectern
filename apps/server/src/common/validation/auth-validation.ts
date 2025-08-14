/*
 * Copyright (c) 2025 The Ontario Institute for Cancer Research. All rights reserved
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

import { z } from 'zod';

export const userDataResponseSchema = z.object({
	userinfo: z.object({
		emails: z.array(
			z
				.object({
					type: z.string(),
					address: z.string(),
				})
				.optional(),
		),
		pcgl_id: z.string(),
		site_admin: z.boolean(),
		site_curator: z.boolean(),
	}),
	study_authorizations: z.object({
		editable_studies: z.array(z.string()),
		readable_studies: z.array(z.string()),
	}),
	dac_authorizations: z.array(
		z.object({
			end_date: z.string(),
			start_date: z.string(),
			study_id: z.string(),
		}),
	),
	groups: z.array(
		z.object({
			id: z.coerce.string(),
			name: z.string(),
			description: z.string(),
		}),
	),
});

export type UserDataResponseSchemaType = z.infer<typeof userDataResponseSchema>;
export type Groups = Pick<UserDataResponseSchemaType, 'groups'>;
