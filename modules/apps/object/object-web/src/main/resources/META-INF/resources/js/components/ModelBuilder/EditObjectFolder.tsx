/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	API,
	ModalEditExternalReferenceCode,
} from '@liferay/object-js-components-web';
import React, {useEffect, useState} from 'react';
import {
	Elements,
	FlowElement,
	Node,
	isNode,
	useStore,
} from 'react-flow-renderer';

import {formatActionURL} from '../../utils/fds';
import {KeyValuePair} from '../ObjectDetails/EditObjectDetails';
import {ModalAddObjectDefinition} from '../ViewObjectDefinitions/ModalAddObjectDefinition';
import {ModalDeleteObjectDefinition} from '../ViewObjectDefinitions/ModalDeleteObjectDefinition';
import {ModalEditObjectFolder} from '../ViewObjectDefinitions/ModalEditObjectFolder';
import {DeletedObjectDefinition} from '../ViewObjectDefinitions/ViewObjectDefinitions';
import {
	deleteObjectDefinition,
	getUpdatedModelBuilderStructurePayload,
} from '../ViewObjectDefinitions/objectDefinitionUtil';
import Diagram from './Diagram/Diagram';
import EditObjectFolderHeader from './EditObjectFolderHeader/EditObjectFolderHeader';
import {ModalPublishObjectDefinitions} from './EditObjectFolderHeader/ModalPublishObjectDefinitions';
import LeftSidebar from './LeftSidebar/LeftSidebar';
import {useObjectFolderContext} from './ModelBuilderContext/objectFolderContext';
import {TYPES} from './ModelBuilderContext/typesEnum';
import {RedirectToEditObjectDetailsModal} from './ObjectDefinitionNode/RedirectToEditObjectDetailsModal';
import {RightSideBar} from './RightSidebar/index';

import './EditObjectFolder.scss';

interface EditObjectFolder {
	companyKeyValuePairs: KeyValuePair[];
	objectRelationshipDeletionTypes: LabelValueObject[];
	siteKeyValuePairs: KeyValuePair[];
}

export default function EditObjectFolder({
	companyKeyValuePairs,
	objectRelationshipDeletionTypes,
	siteKeyValuePairs,
}: EditObjectFolder) {
	const [
		{
			baseResourceURL,
			changeVisibilityModals,
			deleteObjectDefinition,
			editObjectDefinitionURL,
			elements,
			objectDefinitionsStorageTypes,
			objectFolderName,
			rightSidebarType,
			selectedObjectDefinitionNode,
			selectedObjectFolder,
			showChangesSaved,
		},
		dispatch,
	] = useObjectFolderContext();

	const store = useStore();

	const {nodes} = store.getState();
	const id = selectedObjectDefinitionNode?.data?.id;
	const idNumber = Number(id);

	const viewObjectDetailsURL = formatActionURL(
		editObjectDefinitionURL,
		idNumber
	);

	const [newExternalReferenceCode, setNewExternalReferenceCode] = useState(
		selectedObjectDefinitionNode?.data?.externalReferenceCode
	);

	const handleDeleteObjectDefinition = (
		deleteObjectDefinition: DeletedObjectDefinition
	) => {
		dispatch({
			payload: {
				newDeleteObjectDefinition: deleteObjectDefinition,
			},
			type: TYPES.SET_DELETE_OBJECT_DEFINITION,
		});
	};

	useEffect(() => {
		dispatch({
			payload: {
				isLoadingObjectFolder: true,
			},
			type: TYPES.SET_LOADING_OBJECT_FOLDER,
		});

		const updateModelBuilderStructure = async () => {
			const payload = await getUpdatedModelBuilderStructurePayload(
				objectFolderName
			);

			dispatch({
				payload,
				type: TYPES.UPDATE_MODEL_BUILDER_STRUCTURE,
			});

			dispatch({
				payload: {
					isLoadingObjectFolder: false,
				},
				type: TYPES.SET_LOADING_OBJECT_FOLDER,
			});
		};

		updateModelBuilderStructure();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [objectFolderName]);

	useEffect(() => {
		if (showChangesSaved) {
			setTimeout(() => {
				dispatch({
					payload: {updatedShowChangesSaved: false},
					type: TYPES.SET_SHOW_CHANGES_SAVED,
				});
			}, 5000);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showChangesSaved]);

	return (
		<>
			{changeVisibilityModals.addObjectDefinition && (
				<ModalAddObjectDefinition
					handleOnClose={() =>

						// setShowModal((previousState: ModelBuilderModals) => ({
						// 	...previousState,
						// 	addObjectDefinition: false,
						// }))'

						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeVisibilityModals,
									addObjectDefinition: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						})
					}
					objectDefinitionsStorageTypes={
						objectDefinitionsStorageTypes
					}
					objectFolderExternalReferenceCode={
						selectedObjectFolder.externalReferenceCode
					}
					onAfterSubmit={(newObjectDefinition) => {
						dispatch({
							payload: {
								newObjectDefinition,
								objectDefinitionNodes: nodes,
								selectedObjectFolderName:
									selectedObjectFolder.name,
							},
							type: TYPES.ADD_OBJECT_DEFINITION_TO_OBJECT_FOLDER,
						});
					}}
					reload={false}
				/>
			)}

			{/* {changeVisibilityModals.addObjectField && (
				<ModalAddObjectField
					baseResourceURL={baseResourceURL}
					creationLanguageId={defaultLanguageId}
					objectDefinitionExternalReferenceCode={
						externalReferenceCode
					}
					objectDefinitionName={name}
					onAfterSubmit={(newObjectField) => {
						if (selectedObjectDefinitionNode) {
							dispatch({
								payload: {
									newObjectField,
									objectDefinitionExternalReferenceCode: externalReferenceCode,
									objectDefinitionNodes: nodes,
									objectRelationshipEdges: edges,
									selectedObjectDefinitionNode,
								},
								type: TYPES.ADD_OBJECT_FIELD,
							});

							dispatch({
								payload: {
									objectDefinitionNodeDraggable: true,
									objectDefinitionNodes: nodes,
									objectRelationshipEdges: edges,
									selectedObjectDefinitionId: id.toString(),
								},
								type:
									TYPES.SET_SELECTED_OBJECT_DEFINITION_NODE_DRAGGRABLE,
							});

							openToast({
								message: Liferay.Language.get(
									'field-successfully-added'
								),
								type: 'success',
							});
							// setShowModal((prevState) => ({
							// 	...prevState,
							// 	addObjectField: false,
							// }));
							setShowAllObjectFields(true);
						}
					}}
					setVisibility={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeVisibilityModals,
									addObjectField: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						});
					}}
				/>
			)} */}

			{changeVisibilityModals.editObjectDefinitionExternalReferenceCode && (
				<ModalEditExternalReferenceCode
					externalReferenceCode={newExternalReferenceCode as string}
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeVisibilityModals,
									editObjectDefinitionExternalReferenceCode: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						});
					}}
					helpMessage={Liferay.Language.get(
						'unique-key-for-referencing-the-object-definition'
					)}
					onExternalReferenceCodeChange={(
						externalReferenceCode: string
					) => {
						const updatedElements = elements.map((element) => {
							if (
								isNode(element) &&
								(element as Node<ObjectDefinitionNodeData>)
									.id === id?.toString()
							) {
								return {
									...element,
									data: {
										...element.data,
										externalReferenceCode,
									},
								};
							}

							return element;
						}) as Elements<ObjectDefinitionNodeData>;

						dispatch({
							payload: {
								newElements: updatedElements,
							},
							type: TYPES.SET_ELEMENTS,
						});
					}}
					onGetEntity={() =>
						API.getObjectDefinitionById(
							selectedObjectDefinitionNode?.data?.id as number
						)
					}
					saveURL={`/o/object-admin/v1.0/object-definitions/${id}`}
					setExternalReferenceCode={setNewExternalReferenceCode}
				/>
			)}

			{changeVisibilityModals.deleteObjectDefinition &&
				deleteObjectDefinition && (
					<ModalDeleteObjectDefinition
						handleDeleteObjectDefinition={() =>
							handleDeleteObjectDefinition
						}
						handleOnClose={() => {
							dispatch({
								payload: {
									newChangeModalVisibility: {
										...changeVisibilityModals,
										deleteObjectDefinition: false,
									},
								},
								type: TYPES.CHANGE_MODAL_VISIBILITY,
							});
						}}
						objectDefinition={deleteObjectDefinition}
					/>
				)}

			{changeVisibilityModals.editObjectFolder && (
				<ModalEditObjectFolder
					externalReferenceCode={
						selectedObjectFolder.externalReferenceCode
					}
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeVisibilityModals,
									editObjectFolder: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						});
					}}
					id={selectedObjectFolder.id}
					initialLabel={selectedObjectFolder.label}
					name={selectedObjectFolder.name}
				/>
			)}

			{changeVisibilityModals.publishObjectDefinitions && (
				<ModalPublishObjectDefinitions
					disableAutoClose={true}
					dispatch={dispatch}
					elements={elements}
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeVisibilityModals,
									publishObjectDefinitions: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						});
					}}
				/>
			)}

			{changeVisibilityModals.redirectToEditObjectDefinitionDetails && (
				<RedirectToEditObjectDetailsModal
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeVisibilityModals,
									redirectToEditObjectDefinitionDetails: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						});
					}}
					viewObjectDetailsURL={viewObjectDetailsURL}
				/>
			)}

			<EditObjectFolderHeader
				hasDraftObjectDefinitions={elements.some(
					(element) =>
						(element as FlowElement<ObjectDefinitionNodeData>).data
							?.status?.code === 2
				)}
				selectedObjectFolder={selectedObjectFolder}
				setShowModal={() => {}}
			/>
			<div className="lfr-objects__model-builder-diagram-container">
				<LeftSidebar setShowModal={() => {}} />

				<Diagram setShowModal={() => {}} />

				<RightSideBar.Root>
					{rightSidebarType === 'empty' && <RightSideBar.Empty />}

					{rightSidebarType === 'objectDefinitionDetails' && (
						<RightSideBar.ObjectDefinitionDetails
							companyKeyValuePairs={companyKeyValuePairs}
							siteKeyValuePairs={siteKeyValuePairs}
						/>
					)}

					{rightSidebarType === 'objectFieldDetails' && (
						<RightSideBar.ObjectFieldDetails />
					)}

					{rightSidebarType === 'objectRelationshipDetails' && (
						<RightSideBar.ObjectRelationshipDetails
							objectRelationshipDeletionTypes={
								objectRelationshipDeletionTypes
							}
						/>
					)}
				</RightSideBar.Root>
			</div>
		</>
	);
}
