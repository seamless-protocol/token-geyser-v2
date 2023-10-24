import { useState } from 'react'
import styled from 'styled-components'
import tw from 'twin.macro'
import close from 'assets/close.svg'

const Banner = () => {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <>
      {showBanner ? (
        <BannerContainer>
          <TextContainer>
            <p>
              <b>Staking Farms will be temporarily inactive starting November 8th.</b> If your are currently using the
              Staking Farms, you will need to unstake and withdraw your position on November 8th to continue earning OG
              points. Learn more about how to unstake/withdraw{' '}
              <a
                href="https://seamlessprotocol.medium.com/unstaking-withdrawing-on-seamless-protocol-a-step-by-step-guide-e25e72d2b73b"
                target="_blank"
                rel="noopener noreferrer"
              >
                <b>here</b>
              </a>
              .
            </p>
          </TextContainer>
          <button onClick={() => setShowBanner(false)} type="button">
            <CloseImage
              src={close}
              alt="close banner icon"
              width={20}
              height={20}
              className="absolute right-2 top-3 sm:right-6 sm:top-3"
            />
          </button>
        </BannerContainer>
      ) : null}
    </>
  )
}

export default Banner

const BannerContainer = styled.div`
  ${tw`flex w-full items-center justify-center bg-banner text-black sm:p-3 -mb-4`}
`

const TextContainer = styled.div`
  ${tw`text-xs sm:text-sm w-3/4 text-center`}
`

const CloseImage = styled.img`
  ${tw`absolute right-2 top-3 sm:right-6 sm:top-3`}
`
