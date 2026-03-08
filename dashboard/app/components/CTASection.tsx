import { getCTAContent } from "../../lib/content";
import { EmailCapture } from "./EmailCapture";

export async function CTASection({ track }: { track: "light" | "dark" }) {
	const cta = await getCTAContent(track);

	return (
		<section className="relative py-16 text-center" id="subscribe">
			<div className="relative z-[1]">
				<EmailCapture
					track={track}
					heading={cta.heading}
					subheading={cta.subheading}
					inputPlaceholder={cta.input_placeholder}
					buttonText={cta.button_text}
					successTitle={cta.success_title}
					successMessage={cta.success_message}
				/>
			</div>
		</section>
	);
}
