import { IconAnchor, IconBrandInstagram, IconBrandTelegram, IconBrandYoutube } from '@tabler/icons-react';
import { FOOTER_LINKS } from '@/data/landing';

const SOCIALS = [
  { href: 'https://www.instagram.com/code.marshal_/', label: 'Instagram', Icon: IconBrandInstagram },
  { href: 'https://t.me/code_Marshal', label: 'Telegram', Icon: IconBrandTelegram },
  { href: 'https://www.youtube.com/@Code.Marshal', label: 'YouTube', Icon: IconBrandYoutube },
];

/** Server component — no interactivity needed. */
export default function Footer() {
  return (
    <footer className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-around gap-8 bg-mine-shaft-950 p-4 pt-20 pb-5">
        <div data-aos="fade-up" data-aos-offset="0" className="flex w-1/4 flex-col gap-4 max-sm:w-1/3 max-xs:w-1/2 max-xsm:w-full">
          <div className="flex items-center gap-1 text-bright-sun-400">
            <IconAnchor className="h-6 w-6" stroke={2.5} />
            <div className="text-xl font-semibold">JobHook</div>
          </div>
          <p className="text-sm text-mine-shaft-300">
            Job portal with user profiles, skill updates, certifications, work experience and admin job postings.
          </p>
          <div className="flex gap-3 text-bright-sun-400">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="rounded-full bg-mine-shaft-900 p-2 hover:bg-mine-shaft-700">
                <Icon />
              </a>
            ))}
          </div>
        </div>
        {FOOTER_LINKS.map((group) => (
          <div key={group.title} data-aos="fade-up" data-aos-offset="0">
            <div className="mb-4 text-lg font-semibold text-bright-sun-400">{group.title}</div>
            {group.links.map((link) => (
              <div key={link} className="mb-1 cursor-pointer text-sm text-mine-shaft-300 transition duration-300 ease-in-out hover:translate-x-2 hover:text-bright-sun-400">
                {link}
              </div>
            ))}
          </div>
        ))}
      </div>
      <hr className="border-mine-shaft-800" />
      <div data-aos="flip-left" data-aos-offset="0" className="p-5 text-center font-medium">
        Designed &amp; Developed By{' '}
        <a className="font-semibold text-bright-sun-400 hover:underline" href="https://github.com/Code-Mars" target="_blank" rel="noopener noreferrer">
          Chandrabhan Maurya
        </a>
      </div>
    </footer>
  );
}
