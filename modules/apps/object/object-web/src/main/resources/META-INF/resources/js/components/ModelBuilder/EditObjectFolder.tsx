/**
 * SPDX-FileCopyrightText: (c) 2023 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useEffect, useState} from 'react';
import {
	Elements,
	FlowElement,
	Node,
	isNode,
	useStore,
} from 'react-flow-renderer';

import {KeyValuePair} from '../ObjectDetails/EditObjectDetails';
import {ModalAddObjectDefinition} from '../ViewObjectDefinitions/ModalAddObjectDefinition';
import {ModalEditObjectFolder} from '../ViewObjectDefinitions/ModalEditObjectFolder';
import {getUpdatedModelBuilderStructurePayload} from '../ViewObjectDefinitions/objectDefinitionUtil';
import Diagram from './Diagram/Diagram';
import EditObjectFolderHeader from './EditObjectFolderHeader/EditObjectFolderHeader';
import {ModalPublishObjectDefinitions} from './EditObjectFolderHeader/ModalPublishObjectDefinitions';
import LeftSidebar from './LeftSidebar/LeftSidebar';
import {useObjectFolderContext} from './ModelBuilderContext/objectFolderContext';
import {TYPES} from './ModelBuilderContext/typesEnum';
import {RightSideBar} from './RightSidebar/index';

import './EditObjectFolder.scss';

import {
	API,
	ModalEditExternalReferenceCode,
	openToast,
} from '@liferay/object-js-components-web';
import {createResourceURL} from 'frontend-js-web';

import {formatActionURL} from '../../utils/fds';
import {ModalAddObjectField} from '../ObjectField/ModalAddObjectField';
import {ModalAddObjectRelationship} from '../ObjectRelationship/ModalAddObjectRelationship';
import {ModalDeleteObjectDefinition} from '../ViewObjectDefinitions/ModalDeleteObjectDefinition';
import {DeletedObjectDefinition} from '../ViewObjectDefinitions/ViewObjectDefinitions';
import {RedirectToEditObjectDetailsModal} from './ObjectDefinitionNode/RedirectToEditObjectDetailsModal';

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
			changeModalVisibility,
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

	const {edges, nodes} = store.getState();
	const [
		objectRelationshipParameterRequired,
		setObjectRelationshipParameterRequired,
	] = useState(false);
	const selectedObjectDefinitionNodeId =
		selectedObjectDefinitionNode?.data?.id ?? 0;

	const selectedObjectDefinitionNodeSelected =
		selectedObjectDefinitionNode?.data?.selected;

	const viewObjectDetailsURL = formatActionURL(
		editObjectDefinitionURL,
		selectedObjectDefinitionNodeId
	);

	const [newExternalReferenceCode, setNewExternalReferenceCode] = useState(
		selectedObjectDefinitionNode?.data?.externalReferenceCode as string
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

	const updateModelBuilderStructure = async (
		newObjectRelationshipId: number
	) => {
		const payload = await getUpdatedModelBuilderStructurePayload(
			selectedObjectFolder.name
		);

		dispatch({
			payload: {
				...payload,
				rightSidebarType: 'objectRelationshipDetails',
				selectedObjectRelationshipEdgeId: newObjectRelationshipId,
			},
			type: TYPES.UPDATE_MODEL_BUILDER_STRUCTURE,
		});

		dispatch({
			payload: {
				objectDefinitionNodes: nodes,
				objectRelationshipEdges: edges,
				selectedObjectRelationshipId: newObjectRelationshipId,
			},
			type: TYPES.SET_SELECTED_OBJECT_RELATIONSHIP_EDGE,
		});
	};

	useEffect(() => {
		const makeFetch = async () => {
			if (selectedObjectDefinitionNodeSelected) {
				const url = createResourceURL(baseResourceURL, {
					objectDefinitionId: selectedObjectDefinitionNodeId,
					p_p_resource_id:
						'/object_definitions/get_object_relationship_info',
				}).href;

				const {parameterRequired} = await API.fetchJSON<{
					parameterRequired: boolean;
				}>(url);

				setObjectRelationshipParameterRequired(parameterRequired);
			}
		};

		makeFetch();
	}, [
		baseResourceURL,
		selectedObjectDefinitionNodeId,
		selectedObjectDefinitionNodeSelected,
	]);

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
			{changeModalVisibility.addObjectDefinition && (
				<ModalAddObjectDefinition
					handleOnClose={() =>
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeModalVisibility,
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

			{changeModalVisibility.addObjectField && (
				<ModalAddObjectField
					baseResourceURL={baseResourceURL}
					creationLanguageId={
						selectedObjectDefinitionNode?.data
							?.defaultLanguageId as Liferay.Language.Locale
					}
					objectDefinitionExternalReferenceCode={
						selectedObjectDefinitionNode?.data
							?.externalReferenceCode as string
					}
					objectDefinitionName={
						selectedObjectDefinitionNode?.data?.name as string
					}
					onAfterSubmit={(newObjectField) => {
						const {edges, nodes} = store.getState();

						if (selectedObjectDefinitionNode) {
							dispatch({
								payload: {
									newObjectField,
									objectDefinitionExternalReferenceCode: newExternalReferenceCode,
									objectDefinitionNodes: nodes,
									objectRelationshipEdges: edges,
									selectedObjectDefinitionNode,
								},
								type: TYPES.ADD_OBJECT_FIELD,
							});

							openToast({
								message: Liferay.Language.get(
									'field-successfully-added'
								),
								type: 'success',
							});
							dispatch({
								payload: {
									newChangeModalVisibility: {
										...changeModalVisibility,
										addObjectField: false,
									},
								},
								type: TYPES.CHANGE_MODAL_VISIBILITY,
							});
							selectedObjectDefinitionNode?.data?.showAllFields;
						}
					}}
					setVisibility={() =>
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeModalVisibility,
									addObjectField: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						})
					}
				/>
			)}

			{changeModalVisibility.addObjectRelationship && (
				<ModalAddObjectRelationship
					baseResourceURL={baseResourceURL}
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeModalVisibility,
									addObjectRelationship: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						});
					}}
					objectDefinitionExternalReferenceCode1={
						selectedObjectDefinitionNode?.data
							?.externalReferenceCode as string
					}
					objectRelationshipParameterRequired={
						objectRelationshipParameterRequired
					}
					onAfterSubmit={(newObjectRelationshipId: number) =>
						updateModelBuilderStructure(newObjectRelationshipId)
					}
					reload={false}
				/>
			)}

			{changeModalVisibility.deleteObjectDefinition &&
				deleteObjectDefinition && (
					<ModalDeleteObjectDefinition
						handleDeleteObjectDefinition={() =>
							handleDeleteObjectDefinition
						}
						handleOnClose={() => {
							dispatch({
								payload: {
									newChangeModalVisibility: {
										...changeModalVisibility,
										deleteObjectDefinition: false,
									},
								},
								type: TYPES.CHANGE_MODAL_VISIBILITY,
							});
						}}
						objectDefinition={deleteObjectDefinition}
					/>
				)}

			{changeModalVisibility.editObjectDefinitionExternalReferenceCode && (
				<ModalEditExternalReferenceCode
					externalReferenceCode={newExternalReferenceCode}
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeModalVisibility,
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
								(element as Node<ObjectDefinitionNodeData>).data
									?.id === selectedObjectDefinitionNodeId
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
							selectedObjectDefinitionNodeId
						)
					}
					saveURL={`/o/object-admin/v1.0/object-definitions/${selectedObjectDefinitionNodeId}`}
					setExternalReferenceCode={setNewExternalReferenceCode}
				/>
			)}

			{changeModalVisibility.editObjectFolder && (
				<ModalEditObjectFolder
					externalReferenceCode={
						selectedObjectFolder.externalReferenceCode
					}
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeModalVisibility,
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

			{changeModalVisibility.publishObjectDefinitions && (
				<ModalPublishObjectDefinitions
					disableAutoClose={true}
					dispatch={dispatch}
					elements={elements}
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeModalVisibility,
									publishObjectDefinitions: false,
								},
							},
							type: TYPES.CHANGE_MODAL_VISIBILITY,
						});
					}}
				/>
			)}

			{changeModalVisibility.redirectToEditObjectDefinitionDetails && (
				<RedirectToEditObjectDetailsModal
					handleOnClose={() => {
						dispatch({
							payload: {
								newChangeModalVisibility: {
									...changeModalVisibility,
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
			/>

			<div className="lfr-objects__model-builder-content">
				<LeftSidebar />

				<Diagram />

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
