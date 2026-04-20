import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { EquipmentService } from '../../core/services/equipment.service'
import { Equipment } from '../../core/interfaces/equipment.interface'

const REVIEWS = [
	{
		name: 'Aizat Bekova',
		role: 'Commercial Director',
		avatar: 'AB',
		rating: 5,
		text: 'Exceptional quality equipment and seamless booking process. The Sony A7 IV I rented produced outstanding results for our product campaign. Will definitely return.'
	},
	{
		name: 'Damir Seitkali',
		role: 'Videographer',
		avatar: 'DS',
		rating: 5,
		text: 'The Blackmagic 6K rental was flawless — clean sensor, no dead pixels, fully charged. Gear Rental has become my go-to for every production in Almaty.'
	},
	{
		name: 'Zhanna Nurova',
		role: 'Portrait Photographer',
		avatar: 'ZN',
		rating: 5,
		text: 'Rented the Profoto B10 kit for a two-day studio shoot. Everything arrived perfectly packed. Customer service was responsive and professional throughout.'
	}
]

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, RouterLink],
	template: `
		<div class="bg-white">
			<!-- ─── HERO ─────────────────────────────────────────── -->
			<section
				class="relative h-screen min-h-[600px] bg-black overflow-hidden flex flex-col"
			>
				<!-- Background video -->
				<video
					#heroVideo
					autoplay
					muted
					loop
					playsinline
					class="absolute inset-0 w-full h-full object-cover opacity-60"
				>
					<source src="/assets/videoback.mp4" type="video/mp4" />
				</video>

				<!-- Gradient overlay — dark at bottom, lighter at top -->
				<div
					class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"
				></div>

				<!-- Content — left aligned -->
				<div
					class="relative z-10 flex-1 flex flex-col justify-center w-full px-6 sm:px-12 lg:px-20 max-w-3xl"
				>
					<p class="text-white/40 text-[10px] tracking-brand uppercase mb-6">
						Almaty, Kazakhstan — Est. 2026
					</p>

					<h1
						class="text-white font-bold uppercase tracking-tight leading-tight
                      text-4xl sm:text-5xl md:text-6xl mb-4"
					>
						<span class="block">Professional Gear,</span>
						<span class="block">Available by the Day</span>
					</h1>

					<p class="text-white/50 text-sm mb-10 max-w-sm">
						Cameras, lenses, lighting, drones — everything you need for your
						next production.
					</p>

					<a
						routerLink="/catalog"
						class="self-start bg-white text-black px-10 py-3.5 text-[11px] tracking-brand uppercase
                    font-medium hover:bg-white/90 transition-colors"
					>
						Browse Equipment
					</a>
				</div>

				<!-- Scroll hint -->
				<div class="relative z-10 flex justify-center pb-6">
					<div class="flex flex-col items-center gap-1.5 opacity-30">
						<div class="w-px h-8 bg-white/50"></div>
					</div>
				</div>
			</section>

			<!-- ─── FEATURED EQUIPMENT ────────────────────────────── -->
			<section class="max-w-screen-xl mx-auto px-6 py-20">
				<div class="flex items-end justify-between mb-8">
					<div>
						<p class="text-[10px] tracking-brand uppercase text-gray-400 mb-1">
							Selection
						</p>
						<h2 class="text-2xl font-bold uppercase tracking-tight">
							Featured Equipment
						</h2>
					</div>
					<a
						routerLink="/catalog"
						class="text-[11px] tracking-label uppercase border-b border-black pb-0.5
                    hover:opacity-50 transition-opacity hidden sm:block"
					>
						View All →
					</a>
				</div>

				@if (loadingItems) {
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100">
						@for (i of [1, 2, 3]; track i) {
							<div class="bg-white">
								<div class="aspect-[3/4] bg-gray-100 animate-pulse"></div>
								<div class="p-4 space-y-2">
									<div class="h-2.5 bg-gray-100 animate-pulse w-1/3"></div>
									<div class="h-4 bg-gray-100 animate-pulse w-2/3"></div>
									<div class="h-3 bg-gray-100 animate-pulse w-1/4 mt-2"></div>
								</div>
							</div>
						}
					</div>
				} @else {
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100">
						@for (item of featuredItems; track item.id) {
							<a
								[routerLink]="['/equipment', item.id]"
								class="bg-white group block"
							>
								<div class="aspect-[3/4] overflow-hidden bg-gray-50">
									@if (item.image) {
										<img
											[src]="item.image"
											[alt]="item.name"
											class="w-full h-full object-cover group-hover:scale-[1.03]
                                transition-transform duration-500 ease-out"
										/>
									} @else {
										<div class="w-full h-full flex items-center justify-center">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="w-12 h-12 text-gray-200"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1"
													d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1"
													d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
												/>
											</svg>
										</div>
									}
								</div>
								<div class="p-4">
									<p class="text-[10px] tracking-label uppercase text-gray-400">
										{{ item.category_detail?.name }}
									</p>
									<p class="text-sm font-medium mt-0.5">{{ item.name }}</p>
									<p class="text-sm mt-2">
										₸{{ item.daily_rate | number: '1.0-0'
										}}<span class="text-gray-400 text-xs"> / day</span>
									</p>
								</div>
							</a>
						}
					</div>
				}

				<div class="mt-6 sm:hidden">
					<a
						routerLink="/catalog"
						class="text-[11px] tracking-label uppercase border-b border-black pb-0.5"
					>
						View All Equipment →
					</a>
				</div>
			</section>

			<!-- ─── ABOUT ──────────────────────────────────────────── -->
			<section class="border-t border-gray-100">
				<div class="max-w-screen-xl mx-auto px-6 py-20">
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<!-- Text -->
						<div>
							<p
								class="text-[10px] tracking-brand uppercase text-gray-400 mb-3"
							>
								About Us
							</p>
							<h2
								class="text-4xl font-bold uppercase leading-tight tracking-tight mb-6"
							>
								Kazakhstan's<br />Premier Gear<br />Rental
							</h2>
							<p class="text-gray-500 text-sm leading-relaxed mb-4">
								Founded in Almaty, Gear Rental was built for creators who demand
								professional-grade equipment without the cost of ownership.
								Whether you're shooting a feature film, a brand campaign, or a
								personal project — we have the tools you need.
							</p>
							<p class="text-gray-500 text-sm leading-relaxed mb-8">
								Our inventory is serviced, tested, and ready to perform. Every
								item ships with full accessories, charged batteries, and
								formatted cards where applicable.
							</p>

							<div class="grid grid-cols-2 gap-6">
								<div class="border-t border-gray-200 pt-4">
									<p class="text-xl font-bold tracking-tight">Same-day</p>
									<p
										class="text-[11px] tracking-label uppercase text-gray-400 mt-0.5"
									>
										Pickup available
									</p>
								</div>
								<div class="border-t border-gray-200 pt-4">
									<p class="text-xl font-bold tracking-tight">Insured</p>
									<p
										class="text-[11px] tracking-label uppercase text-gray-400 mt-0.5"
									>
										All equipment covered
									</p>
								</div>
								<div class="border-t border-gray-200 pt-4">
									<p class="text-xl font-bold tracking-tight">Tested</p>
									<p
										class="text-[11px] tracking-label uppercase text-gray-400 mt-0.5"
									>
										Before every rental
									</p>
								</div>
								<div class="border-t border-gray-200 pt-4">
									<p class="text-xl font-bold tracking-tight">Support</p>
									<p
										class="text-[11px] tracking-label uppercase text-gray-400 mt-0.5"
									>
										7 days a week
									</p>
								</div>
							</div>
						</div>

						<!-- Visual panel -->
						<div class="relative">
							<div class="aspect-[4/5] overflow-hidden bg-black">
								<img
									src="/assets/about-photo.jpeg"
									alt="About Gear Rental"
									class="w-full h-full object-cover object-center opacity-90 grayscale"
								/>
							</div>
							<!-- Floating tag -->
							<div
								class="absolute -bottom-4 -left-4 bg-white border border-gray-100 px-5 py-4 shadow-sm"
							>
								<p class="text-xs font-bold uppercase tracking-tight">
									Free Delivery
								</p>
								<p
									class="text-[10px] tracking-label uppercase text-gray-400 mt-0.5"
								>
									Orders over ₸50 000
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- ─── REVIEWS ────────────────────────────────────────── -->
			<section class="border-t border-gray-100 bg-gray-50/50">
				<div class="max-w-screen-xl mx-auto px-6 py-20">
					<div class="mb-10">
						<p class="text-[10px] tracking-brand uppercase text-gray-400 mb-1">
							Testimonials
						</p>
						<h2 class="text-2xl font-bold uppercase tracking-tight">
							What Clients Say
						</h2>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
						@for (review of reviews; track review.name) {
							<div class="bg-white p-8 flex flex-col">
								<!-- Stars -->
								<div class="flex items-center gap-0.5 mb-5">
									@for (star of [1, 2, 3, 4, 5]; track star) {
										<svg class="w-3 h-3 fill-black" viewBox="0 0 20 20">
											<path
												d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
											/>
										</svg>
									}
								</div>

								<p class="flex-1 text-sm text-gray-600 leading-relaxed mb-6">
									"{{ review.text }}"
								</p>

								<div
									class="flex items-center gap-3 border-t border-gray-100 pt-5 mt-auto"
								>
									<div
										class="w-8 h-8 bg-black text-white flex items-center justify-center
                              text-[10px] font-bold tracking-wide flex-shrink-0"
									>
										{{ review.avatar }}
									</div>
									<div>
										<p class="text-xs font-semibold">{{ review.name }}</p>
										<p
											class="text-[10px] tracking-label uppercase text-gray-400"
										>
											{{ review.role }}
										</p>
									</div>
								</div>
							</div>
						}
					</div>
				</div>
			</section>

			<!-- ─── CTA BANNER ─────────────────────────────────────── -->
			<section class="bg-black">
				<div
					class="max-w-screen-xl mx-auto px-6 py-16 flex flex-col sm:flex-row
                    items-start sm:items-center justify-between gap-6"
				>
					<div>
						<p class="text-white/30 text-[10px] tracking-brand uppercase mb-2">
							Ready to shoot?
						</p>
						<h2
							class="text-white text-3xl font-bold uppercase leading-tight tracking-tight"
						>
							Book Your Gear Today
						</h2>
					</div>
					<a
						routerLink="/catalog"
						class="flex-shrink-0 bg-white text-black px-10 py-4 text-[11px] tracking-brand
                    uppercase font-medium hover:bg-white/90 transition-colors"
					>
						Browse Equipment
					</a>
				</div>
			</section>

			<!-- ─── FOOTER ─────────────────────────────────────────── -->
			<footer class="bg-black border-t border-white/10">
				<div class="max-w-screen-xl mx-auto px-6 py-12">
					<div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
						<!-- Brand -->
						<div class="col-span-2 md:col-span-1">
							<p
								class="text-white text-sm font-bold tracking-brand uppercase mb-3"
							>
								Gear Rental
							</p>
							<p class="text-white/40 text-xs leading-relaxed">
								Professional photo &amp; video equipment rental in Almaty,
								Kazakhstan.
							</p>
						</div>

						<!-- Shop -->
						<div>
							<p
								class="text-white/30 text-[10px] tracking-label uppercase mb-4"
							>
								Shop
							</p>
							<ul class="space-y-2.5">
								<li>
									<a
										routerLink="/catalog"
										class="text-white/60 text-xs hover:text-white transition-colors"
										>All Equipment</a
									>
								</li>
								<li>
									<a
										[routerLink]="['/catalog']"
										[queryParams]="{ category: 'cameras' }"
										class="text-white/60 text-xs hover:text-white transition-colors"
										>Cameras</a
									>
								</li>
								<li>
									<a
										[routerLink]="['/catalog']"
										[queryParams]="{ category: 'lenses' }"
										class="text-white/60 text-xs hover:text-white transition-colors"
										>Lenses</a
									>
								</li>
								<li>
									<a
										[routerLink]="['/catalog']"
										[queryParams]="{ category: 'lighting' }"
										class="text-white/60 text-xs hover:text-white transition-colors"
										>Lighting</a
									>
								</li>
								<li>
									<a
										[routerLink]="['/catalog']"
										[queryParams]="{ category: 'drones' }"
										class="text-white/60 text-xs hover:text-white transition-colors"
										>Drones</a
									>
								</li>
							</ul>
						</div>

						<!-- Account -->
						<div>
							<p
								class="text-white/30 text-[10px] tracking-label uppercase mb-4"
							>
								Account
							</p>
							<ul class="space-y-2.5">
								<li>
									<a
										routerLink="/register"
										class="text-white/60 text-xs hover:text-white transition-colors"
										>Register</a
									>
								</li>
								<li>
									<a
										routerLink="/login"
										class="text-white/60 text-xs hover:text-white transition-colors"
										>Sign In</a
									>
								</li>
								<li>
									<a
										routerLink="/bookings"
										class="text-white/60 text-xs hover:text-white transition-colors"
										>My Bookings</a
									>
								</li>
							</ul>
						</div>

						<!-- Contact -->
						<div>
							<p
								class="text-white/30 text-[10px] tracking-label uppercase mb-4"
							>
								Contact
							</p>
							<ul class="space-y-2.5">
								<li class="text-white/60 text-xs">Almaty, Kazakhstan</li>
								<li class="text-white/60 text-xs">info&#64;gearrental.kz</li>
								<li class="text-white/60 text-xs">+7 (727) 000-00-00</li>
							</ul>
						</div>
					</div>

					<div
						class="border-t border-white/10 pt-6 flex flex-col sm:flex-row
                      items-start sm:items-center justify-between gap-3"
					>
						<p class="text-white/20 text-[10px] tracking-label uppercase">
							© 2026 Gear Rental. All rights reserved.
						</p>
						<div class="flex items-center gap-6">
							<a
								href="#"
								class="text-white/20 text-[10px] tracking-label uppercase hover:text-white/50 transition-colors"
								>Privacy</a
							>
							<a
								href="#"
								class="text-white/20 text-[10px] tracking-label uppercase hover:text-white/50 transition-colors"
								>Terms</a
							>
						</div>
					</div>
				</div>
			</footer>
		</div>
	`
})
export class HomeComponent implements OnInit, AfterViewInit {
	private readonly equipmentService = inject(EquipmentService)
	@ViewChild('heroVideo') heroVideoRef!: ElementRef<HTMLVideoElement>

	featuredItems: Equipment[] = []
	loadingItems = false
	reviews = REVIEWS

	ngAfterViewInit(): void {
		const video = this.heroVideoRef?.nativeElement
		if (video) {
			video.muted = true
			video.play().catch(() => {})
		}
	}

	ngOnInit(): void {
		this.loadingItems = true
		this.equipmentService.getAll({ is_available: true }).subscribe({
			next: items => {
				this.featuredItems = items.slice(0, 3)
				this.loadingItems = false
			},
			error: () => {
				this.loadingItems = false
			}
		})
	}
}
