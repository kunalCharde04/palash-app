// components/Navbar.tsx
"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, ShoppingCart, User, LogOut, ExternalLink, Menu, X } from 'lucide-react';
import {PrimaryButton, SecondaryButton} from "@/app/components/ui/buttons/index";
import { useRouter, usePathname } from 'next/navigation'
import type { UserProfile } from '@/app/api/user';
import { clearTokens } from '@/app/utils/save-token';
import Logo from "@/app/assets/logo-light.png";
import Image from 'next/image';

interface NavbarProps {
    user: UserProfile | null;
    isLoading: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, isLoading }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const navigateToAuth = () => {
        router.push('/sign-in');
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    const handleLogout = () => {
        window.location.href = '/';
        clearTokens();
    }

    const navigationLinks = [
        { href: '/', label: 'Home', isActive: pathname === '/' },
        ...(user?.role === 'ADMIN' ? [{ href: '/admin-dashboard/services', label: 'Admin', isActive: pathname.startsWith('/admin-dashboard') }] : []),
        { href: '/services', label: 'Wellness Programs', isActive: pathname === '/services' },
        { href: '/buy-membership', label: 'Buy Membership Plan', isActive: pathname === '/buy-membership' },
        { href: '/bookings', label: 'My Bookings', isActive: pathname === '/bookings' },
        { href: '/about', label: 'About', isActive: pathname === '/about' }
    ];

    return (
        <>
            <nav className={`fixed top-2 sm:top-4 left-1/2 rounded-xl sm:rounded-2xl w-[98%] sm:w-[96%] md:w-[94%] lg:w-[90%] max-w-7xl z-50 transition-all -translate-x-1/2 duration-300 ${isScrolled ? 'bg-white/70 backdrop-blur-md shadow-md' : 'bg-gray-200'
                }`}>
                <div className="mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
                    <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/" className="text-xl font-bold">
                                <Image
                                    src={Logo}
                                    alt="PALASH"
                                    className="object-contain w-[70px] sm:w-[80px] md:w-[100px]"
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className='hidden lg:flex items-center justify-center'>
                            <div className="flex text-sm font-semibold items-center space-x-4 xl:space-x-6">
                                {navigationLinks.map((link) => (
                                    <Link 
                                        key={link.href}
                                        href={link.href} 
                                        className={`text-gray-500 hover:text-gray-900 transition-colors ${link.isActive ? 'text-gray-900 font-bold border-b-2 border-[#012b2b] underline' : ''}`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                            {isLoading ? (
                                <div className="h-6 w-16 sm:h-8 sm:w-20 md:h-10 md:w-24 bg-gray-200 animate-pulse rounded-full"></div>
                            ) : user ? (
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    <span className="hidden md:flex items-center space-x-2 p-1 sm:p-2 rounded-full hover:bg-gray-100">
                                        <span className="text-xs font-medium text-gray-600">Hey👋, @{user.name}</span>
                                    </span>
                                    <PrimaryButton 
                                        onClick={handleLogout} 
                                        className='bg-red-400 hover:bg-red-500 text-xs px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2' 
                                        startIcon={<LogOut size={12} color='white' />}
                                    >
                                        <span className="hidden sm:inline text-xs md:text-sm">Logout</span>
                                        <span className="sm:hidden">Out</span>
                                    </PrimaryButton>
                                </div>
                            ) : (
                                <SecondaryButton 
                                    onClick={navigateToAuth} 
                                    className="px-2 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 text-xs md:text-sm border-gray-600 font-semibold text-gray-800 hover:bg-gray-100"
                                >
                                    <span className="hidden sm:inline">Sign in &#8594;</span>
                                    <span className="sm:hidden">Sign in</span>
                                </SecondaryButton>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="lg:hidden p-1 sm:p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 transition-colors"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? (
                                    <X className="block h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                ) : (
                                    <Menu className="block h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
            )}

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed top-0 right-0 h-full w-64 sm:w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <Image
                            src={Logo}
                            alt="PALASH"
                            className="object-contain w-[80px] sm:w-[100px]"
                        />
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </div>

                    {/* Mobile User Info */}
                    {user && (
                        <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm sm:text-base font-medium text-gray-800">Hey👋, @{user.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600 capitalize">{user.role?.toLowerCase()}</p>
                        </div>
                    )}

                    {/* Mobile Navigation Links */}
                    <nav className="space-y-1">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block px-3 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-md transition-colors ${
                                    link.isActive 
                                        ? 'text-[#012b2b] bg-[#012b2b]/10 border-l-4 border-[#012b2b]' 
                                        : 'text-gray-700 hover:text-[#012b2b] hover:bg-gray-100'
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Auth Section */}
                    {!user && (
                        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                            <SecondaryButton 
                                onClick={navigateToAuth} 
                                className="w-full py-3 sm:py-4 text-base sm:text-lg border-gray-600 font-semibold text-gray-800 hover:bg-gray-100"
                            >
                                Sign in &#8594;
                            </SecondaryButton>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;