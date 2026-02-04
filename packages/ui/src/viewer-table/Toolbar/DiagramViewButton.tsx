/*
 *
 * Copyright (c) 2026 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

import { useState } from 'react';

import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { useDictionaryDataContext } from '../../dictionary-controller/DictionaryDataContext';
import { useThemeContext } from '../../theme/index';

const DiagramViewButton = () => {
	const [isOpen, setIsOpen] = useState(false);
	const theme = useThemeContext();
	const { Eye } = theme.icons;
	const { loading, errors } = useDictionaryDataContext();

	return (
		<>
			<Button icon={<Eye />} onClick={() => setIsOpen(true)} disabled={loading || errors.length > 0}>
				Diagram View
			</Button>
			<Modal
				title="Diagram View"
				subtitle="Select any key field or edge to highlight a relation."
				isOpen={isOpen}
				setIsOpen={setIsOpen}
			/>
		</>
	);
};

export default DiagramViewButton;
