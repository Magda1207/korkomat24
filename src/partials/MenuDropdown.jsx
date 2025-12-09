import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useNavigate } from 'react-router-dom';
import { logout } from '../partials/functions/global';

import Avatar from './UserAvatar'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const MenuDropdown = ({ setLoggedIn, isTeacher, myStatus, handleNavigation, socket, getLeavingConfirmed }) => {

    const navigate = useNavigate();

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button>
                    <Avatar displayStatus={true} myStatus={myStatus} />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute left-1/2 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    href="/profile"
                                    onClick={handleNavigation}
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block px-4 py-2 text-sm'
                                    )}
                                >
                                    Moje konto
                                </a>
                            )}
                        </Menu.Item>
                        {isTeacher == false && <Menu.Item>
                            {({ active }) => (
                                <a
                                    href="#/lessonHistory"
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block px-4 py-2 text-sm'
                                    )}
                                >
                                    Historia Lekcji
                                </a>
                            )}
                        </Menu.Item>}
                        {isTeacher == true && <Menu.Item>
                            {({ active }) => (
                                <a
                                    href="#/publication"
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block px-4 py-2 text-sm'
                                    )}
                                >
                                    Moje ogłoszenie
                                </a>
                            )}
                        </Menu.Item>}
                        {isTeacher == true && <Menu.Item>
                            {({ active }) => (
                                <a
                                    href="#/teacherPanel"
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block px-4 py-2 text-sm'
                                    )}
                                >
                                    Panel korepetytora
                                </a>
                            )}
                        </Menu.Item>}
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'block w-full px-4 py-2 text-left text-sm'
                                    )}
                                    onClick={() => logout(socket, setLoggedIn, getLeavingConfirmed, navigate)}
                                >
                                    Wyloguj
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}

export default MenuDropdown