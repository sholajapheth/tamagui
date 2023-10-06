import {
  Avatar,
  Card,
  Paragraph,
  Theme,
  YStack,
  Spacer,
  H2,
  H3,
  Button,
  XStack,
  Sheet,
  useToastController,
  useClimbColor,
  H5,
} from '@my/ui'
import { api } from 'app/utils/api'
import { format } from 'date-fns'
import { Tables } from '@my/supabase/helpers'
import { FlatList } from 'react-native'
import { LinearGradient } from '@tamagui/linear-gradient'
import { useCallback, useState } from 'react'
import { useUser } from '../../utils/useUser'
import { useQueryClient } from '@tanstack/react-query'

type ListClimb = Tables<'climbs'> & {
  climber: Tables<'profiles'>
}

const displayName = {
  top_rope: 'Top Rope',
  lead_rope: 'Lead Rope',
  boulder: 'Boulder',
} as const
function Climb({
  climb,
  onSelect,
}: {
  climb: ListClimb
  onSelect?: (climb: ListClimb) => void
}) {
  const { color } = useClimbColor(climb.type)

  return (
    <Theme name={color}>
      <Card
        overflow="visible"
        removeClippedSubviews={true}
        height={220}
        position="relative"
        padding="$4"
        marginHorizontal="$3"
        elevation="$0.5"
        shadowRadius={7}
        shadowOpacity={0.2}
        jc="flex-start"
        onPress={() => {
          onSelect?.(climb)
        }}
      >
        <Avatar
          borderColor="$backgroundPress"
          borderWidth={1}
          borderStyle="solid"
          circular
          size="$7"
        >
          {climb.climber.avatar_url && (
            <Avatar.Image src={climb.climber.avatar_url} bg="$background" />
          )}
          <Avatar.Fallback jc="center" ai="center" bc="$background">
            <H2 fontWeight="400">
              {climb.climber.first_name[0]}
              {climb.climber.last_name[0]}
            </H2>
          </Avatar.Fallback>
        </Avatar>

        <YStack
          position="absolute"
          top={0}
          right={0}
          p="$3"
          // Figure out how to make darker
          bg="$backgroundPress"
          borderColor="alt2"
          borderTopWidth={0}
          borderRightWidth={0}
          borderTopRightRadius="$3"
          borderBottomLeftRadius="$3"
          zIndex={1}
          elevation="$1"
          shadowRadius={6}
          shadowOpacity={0.1}
        >
          <Paragraph size="$2" fontWeight="400">
            {displayName[climb.type]}
          </Paragraph>
        </YStack>

        <Card.Header paddingHorizontal={0} jc="center" ai="flex-start">
          <H3 textTransform="uppercase" size="$5">
            {climb.climber.first_name ?? 'unknown climber'}
          </H3>
          <Spacer size="$2" />
          <Paragraph size="$1" fontWeight="800" ellipse>
            @{climb.climber.username}
          </Paragraph>
          <Paragraph size="$1" fontWeight="400" ellipse></Paragraph>
          <Spacer size="$1" />
        </Card.Header>
        <Card.Footer ai="baseline">
          <Paragraph theme="alt2" size="$1" fontWeight="400">
            {format(new Date(climb.start), 'MMM d')} @{' '}
            {format(new Date(climb.start), 'h:mmaaa')}
          </Paragraph>
          <Spacer flex />
        </Card.Footer>
        <Card.Background>
          <LinearGradient
            width="100%"
            height="100%"
            borderRadius="$3"
            zIndex={-1}
            colors={['$red10', '$yellow10']}
            opacity={0.085}
            start={[1, 1]}
            end={[2, 3]}
          />
        </Card.Background>
      </Card>
    </Theme>
  )
}
export function ClimbsTab() {
  const climbsQuery = api.climb.read.useQuery()
  const [open, setOpen] = useState(false)
  const [selectedClimb, setSelectedClimb] = useState<ListClimb | undefined>(
    undefined
  )

  const onSelect = useCallback((climb: ListClimb) => {
    setSelectedClimb(climb)
    setOpen(true)
  }, [])

  return (
    <YStack
      style={{
        paddingBottom: 134,
      }}
    >
      <FlatList
        style={{
          paddingTop: 20,
        }}
        data={climbsQuery.data}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => <Climb onSelect={onSelect} climb={item} />}
        ItemSeparatorComponent={() => <Spacer size="$6" />}
      />
      <SheetDemo climb={selectedClimb} open={open} setOpen={setOpen} />
    </YStack>
  )
}

export const SheetDemo = ({
  climb,
  open,
  setOpen,
}: {
  climb: ListClimb | undefined
  open: boolean
  setOpen: (state: boolean) => void
}) => {
  const [position, setPosition] = useState(0)
  const [modal, setModal] = useState(true)

  const user = useUser()

  const joinMutation = api.climb.join.useMutation()
  const deleteMutation = api.climb.delete.useMutation()
  const queryClient = useQueryClient()

  const { color } = useClimbColor(climb?.type)
  const toast = useToastController()
  // const reminderConfig = k
  //   name: `Climb with ${climb?.climber?.first_name ?? 'unknown climber'}`,
  //   description: climb?.name ?? '',
  //   startDate: format(new Date(climb?.start ?? 0), 'yyyy-MM-dd'),
  //   startTime: format(new Date(climb?.start ?? 0), 'hh:mm'),
  //   endTime: format(
  //     add(new Date(climb?.start ?? 0), {
  //       minutes: intervalToDuration({
  //         start: new Date(climb?.start ?? 0),
  //         end: new Date(climb?.duration ?? 0),
  //       }).minutes,
  //     }),
  //     'hh:mm'
  //   ),
  //   options: ['Google', 'iCal'],
  //   timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  // }
  return (
    <Theme name={color}>
      <Sheet
        forceRemoveScrollEnabled={open}
        modal={modal}
        open={open}
        onOpenChange={setOpen}
        snapPoints={[58]}
        dismissOnSnapToBottom
        position={position}
        onPositionChange={setPosition}
        zIndex={100_000}
        animation="bouncy"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" bg="$backgroundPress" space="$5">
          {/* <Button size="$6" circular icon={ChevronDown} onPress={() => setOpen(false)} /> */}
          {/* <Input width={200} /> */}

          {/* {isWeb && <AddToCalendarButton {...reminderConfig} />} */}
          <YStack height={450}>
            {climb?.climber?.first_name && (
              <>
                <H3 paddingHorizontal="$3" fontSize="$8" pt="$0.5">
                  Climb with {climb.climber.first_name}
                </H3>
                <Paragraph paddingHorizontal="$3" size="$2" fontWeight="400">
                  @{climb.climber.username}
                </Paragraph>
              </>
            )}
            <Spacer size="$2" />
            {climb?.type && (
              <H5 paddingHorizontal="$3" fontSize="$4" theme="alt2">
                {displayName[climb.type]}
              </H5>
            )}
            <Spacer size="$4" />
            {climb && <Climb climb={climb} />}
            <Spacer size="$6" />
            <XStack paddingHorizontal="$3">
              <Button
                padded
                fontSize="$5"
                fontWeight={'700'}
                size="$6"
                theme={'alt2'}
                themeInverse
                borderRadius="$3"
                elevation="$1"
                shadowRadius={10}
                shadowOpacity={0.9}
                onPress={async () => {
                  setOpen(false)
                  if (!climb) return
                  user.user?.id === climb?.created_by
                    ? await deleteMutation.mutateAsync(
                        { climb_id: climb?.id ?? 0 },
                        {
                          onSuccess: () => {
                            toast.show('Climb deleted')
                            queryClient.setQueryData(
                              [['climb', 'read'], { type: 'query' }],
                              (climbs: ListClimb[] | undefined) => {
                                return climbs?.filter((c) => c.id !== climb.id)
                              }
                            )
                          },
                        }
                      )
                    : await joinMutation.mutateAsync(
                        { climb_id: climb?.id ?? 0 },
                        {
                          onSuccess: () => {
                            toast.show('You joined the climb!', {
                              message: `You are climbing with ${climb?.climber.first_name}`,
                            })
                            queryClient.setQueryData(
                              [['climb', 'read'], { type: 'query' }],
                              (climbs: ListClimb[] | undefined) => {
                                return climbs?.filter((c) => c.id !== climb.id)
                              }
                            )
                          },
                          onError: (error) => {
                            // TODO: create toast for error case
                            console.error(error)
                          },
                        }
                      )
                }}
              >
                {user?.user?.id === climb?.created_by ? 'Delete' : 'Join'}
              </Button>
              <Spacer flex />
              <Button
                theme="alt1"
                padded
                fontSize="$5"
                fontWeight={'700'}
                size="$6"
                borderRadius="$3"
                elevation="$1"
                shadowRadius={6}
                shadowOpacity={0.1}
                onPress={() => setOpen(false)}
              >
                Cancel
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </Theme>
  )
}
