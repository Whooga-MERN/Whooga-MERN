
export default function Footer(): JSX.Element {
    return (
        <footer className="text-center text-black my-5">
            <div className="container p-5 mx-auto">
                <div className="">
                    <span className="flex items-center justify-between w-full">
                        <span className="text-xl font-bold">WHOOGA!</span>
                        <span className="text-xl font-bold">Meet the Team
                            <button
                                type="button"
                                className="ml-4 inline-block rounded-full border-2 -50 px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal transition duration-150 ease-in-out hover:border-yellow-400 hover:bg-neutral-900 hover:bg-opacity-80 hover:text-neutral-900 focus:border-neutral-100 focus:text-neutral-100 focus:outline-none focus:ring-0 active:border-neutral-200 active:text-neutral-200 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10">
                                About us
                            </button>
                            </span>
                    </span>
                </div>
            </div>

            {/* <!--Copyright section--> */}
            <div
                className="p-3 text-center bg-black bg-opacity-20">
                © 2024 Copyright:
                Whooga! All rights reserved.
            </div>
        </footer>
    );
}