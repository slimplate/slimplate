import AdminCollection from './AdminCollection.jsx'
import AdminContent from './AdminContent.jsx'
import AdminEdit from './AdminEdit.jsx'
import { AdminProjectList, AdminProject } from './AdminProjectList.jsx'
import AdminSideBar from './AdminSideBar.jsx'
import ButtonPush from './ButtonPush.jsx'
import ModalDialogDelete from './ModalDialogDelete.jsx'
import ModalNewProject from './ModalNewProject.jsx'

import { SlimplateProvider, useSlimplate, useLocalStorage, useFsUser } from './react-github.jsx'

// TODO: these could be split-up
import * as widgets from './widgets.jsx'

// stupid button for doing git tests and stuff
import ButtonDev from './ButtonDev.jsx'

import './style.css'

export { SlimplateProvider, useSlimplate, useLocalStorage, useFsUser, AdminCollection, AdminContent, AdminEdit, AdminProjectList, AdminProject, AdminSideBar, ButtonPush, ButtonDev, ModalDialogDelete, ModalNewProject, widgets }
